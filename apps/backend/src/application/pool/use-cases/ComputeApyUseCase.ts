import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, parseAbi, type PublicClient } from 'viem';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { IPoolApyRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IPoolApyRepository';
import { IPoolEventRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IPoolEventRepository';
import { ApyWindow, PoolApySnapshot } from '@chiliztv/domain/blockchain-indexing/entities/PoolApySnapshot';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../../infrastructure/config/chiliz.config';
import { logger } from '../../../infrastructure/logging/logger';

const POOL_READS_ABI = parseAbi([
    'function totalAssets() view returns (uint256)',
    'function totalSupply() view returns (uint256)',
] as const);

const SECONDS_PER_DAY = 86_400;
const NOISY_SUPPLY_DELTA_BPS = 500; // 5%
const ROUND_BPS_PRECISION = 10_000;

interface PpsAtBlock {
    blockNumber: bigint;
    timestamp: number;
    pps: bigint;
    totalSupply: bigint;
}

/**
 * Computes the LP APY for a single window (7d or 30d) and persists a snapshot.
 *
 * Methodology (from the Lot 3 plan):
 *   APY = ((pps_end / pps_start) - 1) * (365 / period_days)
 *
 * `pps = totalAssets() / totalSupply()` is read at the block whose timestamp
 * is closest to `now - window`. Block lookup uses a binary search on
 * `eth_getBlockByNumber` because chains do not maintain a `blockAtTimestamp`
 * index. PoolEventRepository feeds the noisy-window detector and (when we
 * extend it) the post-fee variant.
 */
@injectable()
export class ComputeApyUseCase {
    private readonly client: PublicClient;
    private readonly poolAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.IPoolApyRepository)
        private readonly apyRepo: IPoolApyRepository,
        @inject(TOKENS.IPoolEventRepository)
        private readonly poolEvents: IPoolEventRepository,
        @inject(TOKENS.INetworkConfig)
        network: INetworkConfig,
    ) {
        this.client = createPublicClient({
            chain: chainFor(networkType),
            transport: http(network.rpcUrl),
        });
        this.poolAddress = network.liquidityPoolAddress as `0x${string}`;
    }

    async execute(): Promise<{ snapshots: PoolApySnapshot[]; warnings: string[] }> {
        const warnings: string[] = [];
        const snapshots: PoolApySnapshot[] = [];

        for (const window of (['7d', '30d'] as ApyWindow[])) {
            try {
                const snapshot = await this.computeWindow(window);
                if (snapshot) {
                    snapshots.push(snapshot);
                } else {
                    logger.info(`ComputeApyUseCase: insufficient history for ${window}`);
                    warnings.push(`Insufficient history for ${window}`);
                }
            } catch (err) {
                logger.error(`ComputeApyUseCase: failed for window ${window}`, {
                    error: err instanceof Error ? err.message : String(err),
                });
                warnings.push(`Compute failed for ${window}`);
            }
        }
        return { snapshots, warnings };
    }

    private async computeWindow(window: ApyWindow): Promise<PoolApySnapshot | null> {
        const periodDays = window === '7d' ? 7 : 30;
        const periodSec = periodDays * SECONDS_PER_DAY;

        const head = await this.client.getBlockNumber();
        const headBlock = await this.client.getBlock({ blockNumber: head });
        const headTimestamp = Number(headBlock.timestamp);
        const startTimestamp = headTimestamp - periodSec;

        const startBlock = await this.findBlockByTimestamp(startTimestamp);
        if (startBlock === null) {
            // Chain doesn't go back that far yet — caller decides whether to
            // surface this as null APY or to fall back to a shorter window.
            return null;
        }

        const [startPps, endPps] = await Promise.all([
            this.readPpsAtBlock(startBlock),
            this.readPpsAtBlock(head),
        ]);
        if (startPps.pps === BigInt(0) || endPps.pps === BigInt(0)) {
            return null;
        }

        // Convert ppsEnd / ppsStart - 1 to bps via integer arithmetic. PPS
        // is in raw asset:share units; the ratio is unit-less. We multiply by
        // 1e18 internally to keep precision then collapse to bps for storage.
        const SCALE = BigInt(1e18);
        const ratio = (endPps.pps * SCALE) / startPps.pps;
        const deltaBps = Number(((ratio - SCALE) * BigInt(ROUND_BPS_PRECISION)) / SCALE);
        const apyBps = Math.round(deltaBps * (365 / periodDays));

        // Noisy-window flag: if total supply changed by > 5% in the window,
        // PPS comparison is less reliable on a low-TVL pool because the
        // ERC4626 inflation-attack offset introduces small drift.
        const noisy = this.isNoisySupplyChange(startPps.totalSupply, endPps.totalSupply);

        return await this.apyRepo.save({
            windowLabel: window,
            ppsStart: startPps.pps,
            ppsEnd: endPps.pps,
            apyBps,
            apyPostFeeBps: null, // Reserved for the LP withdrawal-fee adjustment in a later iteration.
            periodDays,
            noisy,
            blockStart: startPps.blockNumber,
            blockEnd: endPps.blockNumber,
        });
    }

    private async readPpsAtBlock(blockNumber: bigint): Promise<PpsAtBlock> {
        const block = await this.client.getBlock({ blockNumber });
        const ts = Number(block.timestamp);
        try {
            const [totalAssets, totalSupply] = await Promise.all([
                this.client.readContract({
                    address: this.poolAddress,
                    abi: POOL_READS_ABI,
                    functionName: 'totalAssets',
                    blockNumber,
                }) as Promise<bigint>,
                this.client.readContract({
                    address: this.poolAddress,
                    abi: POOL_READS_ABI,
                    functionName: 'totalSupply',
                    blockNumber,
                }) as Promise<bigint>,
            ]);

            if (totalSupply === BigInt(0)) {
                return { blockNumber, timestamp: ts, pps: BigInt(0), totalSupply };
            }
            // Scale by 1e18 so a 12-dp ctvLP share denomination doesn't truncate.
            const pps = (totalAssets * BigInt(1e18)) / totalSupply;
            return { blockNumber, timestamp: ts, pps, totalSupply };
        } catch (err) {
            // `0x` return = the pool proxy didn't exist at that block (window
            // older than deployment). Treat as zero PPS so the caller returns
            // null (= insufficient history) instead of erroring the whole job.
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('returned no data') || msg.includes('"0x"')) {
                return { blockNumber, timestamp: ts, pps: BigInt(0), totalSupply: BigInt(0) };
            }
            throw err;
        }
    }

    /**
     * Binary-search the chain for the block whose timestamp is closest to (and
     * not greater than) the target. Bounded by `head` and `head − 4_000_000`
     * to cap RPC round-trips on cold starts.
     */
    private async findBlockByTimestamp(targetTs: number): Promise<bigint | null> {
        const head = await this.client.getBlockNumber();
        const headBlock = await this.client.getBlock({ blockNumber: head });
        if (Number(headBlock.timestamp) < targetTs) return null;

        let lo: bigint = head > BigInt(4_000_000) ? head - BigInt(4_000_000) : BigInt(0);
        let hi: bigint = head;

        // Pull the lo-block timestamp; if even the lower bound is later than
        // target, we don't have enough history.
        const loBlock = await this.client.getBlock({ blockNumber: lo });
        if (Number(loBlock.timestamp) > targetTs) return null;

        // Standard bisect — invariant: blocks[lo].ts <= target <= blocks[hi].ts
        while (hi - lo > BigInt(1)) {
            const mid: bigint = (lo + hi) / BigInt(2);
            const block = await this.client.getBlock({ blockNumber: mid });
            const ts = Number(block.timestamp);
            if (ts <= targetTs) lo = mid;
            else hi = mid;
        }
        return lo;
    }

    private isNoisySupplyChange(start: bigint, end: bigint): boolean {
        if (start === BigInt(0)) return true;
        const diff = start > end ? start - end : end - start;
        const pctBps = Number((diff * BigInt(ROUND_BPS_PRECISION)) / start);
        return pctBps > NOISY_SUPPLY_DELTA_BPS;
    }
}
