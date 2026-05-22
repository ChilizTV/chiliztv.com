import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../config/chiliz.config';
import { logger } from '../../logging/logger';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import type { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';
import type { ILeaderboardClaimRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardClaimRepository';
import { BaseIndexer } from './BaseIndexer';

const WIN_RECORDED = parseAbiItem(
    'event WinRecorded(address indexed match_, address indexed user, uint256 delta, uint256 newScore)',
);
const EPOCH_CLOSED = parseAbiItem(
    'event EpochClosed(uint256 indexed epochId, bytes32 merkleRoot, uint256 prizePool, uint256 claimExpiry)',
);
const PRIZE_CLAIMED = parseAbiItem(
    'event PrizeClaimed(uint256 indexed epochId, address indexed user, uint256 amount)',
);
const EPOCH_ROLLED_OVER = parseAbiItem(
    'event EpochRolledOver(uint256 indexed epochId, uint256 rolledOver)',
);

const ALL_EVENTS = [WIN_RECORDED, EPOCH_CLOSED, PRIZE_CLAIMED, EPOCH_ROLLED_OVER];

/**
 * Reads `LeaderboardRewards` events into the three leaderboard tables.
 *
 *  - WinRecorded     → increment `leaderboard_scores.total_score`
 *  - EpochClosed     → flip the pending row (matched by tx_hash) to confirmed,
 *                      fill `epoch_id`, `prize_pool`, `claim_expiry`
 *  - PrizeClaimed    → INSERT into `leaderboard_claims`
 *  - EpochRolledOver → flip the epoch row to `status='rolled_over'`
 *
 * If `EpochClosed` lands without a pre-existing pending row (e.g. someone
 * called `closeEpoch` via Etherscan, bypassing our CLI), the indexer still
 * marks it confirmed but with empty `leaves_json` — the claimable hook
 * filters those out because it can't build a merkle proof for them.
 */
@injectable()
export class LeaderboardIndexer extends BaseIndexer {
    private readonly leaderboardAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
        @inject(TOKENS.ILockService)
        lockService: ILockService,
        @inject(TOKENS.ILeaderboardScoreRepository)
        private readonly scoreRepo: ILeaderboardScoreRepository,
        @inject(TOKENS.ILeaderboardEpochRepository)
        private readonly epochRepo: ILeaderboardEpochRepository,
        @inject(TOKENS.ILeaderboardClaimRepository)
        private readonly claimRepo: ILeaderboardClaimRepository,
    ) {
        const address = network.leaderboardRewardsAddress as `0x${string}`;
        super({
            name: 'Leaderboard',
            contractAddress: address,
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
            lockService,
        });
        this.leaderboardAddress = address;
    }

    protected async processBatch(fromBlock: bigint, toBlock: bigint): Promise<void> {
        const logs = await this.client.getLogs({
            address: this.leaderboardAddress,
            events: ALL_EVENTS,
            fromBlock,
            toBlock,
        });
        if (logs.length === 0) return;

        const tsCache = await this.resolveBlockTimestamps(logs);

        for (const log of logs) {
            const eventName = (log as { eventName?: string }).eventName;
            const args = (log as { args?: Record<string, unknown> }).args;
            if (!eventName || !args) continue;
            try {
                switch (eventName) {
                    case 'WinRecorded':
                        await this.handleWinRecorded(args);
                        break;
                    case 'EpochClosed':
                        await this.handleEpochClosed(log, args, tsCache);
                        break;
                    case 'PrizeClaimed':
                        await this.handlePrizeClaimed(log, args, tsCache);
                        break;
                    case 'EpochRolledOver':
                        await this.handleEpochRolledOver(args, log, tsCache);
                        break;
                }
            } catch (err) {
                logger.error(`${this.indexerName}: failed to process log`, {
                    eventName,
                    txHash: log.transactionHash,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }

    private async handleWinRecorded(args: Record<string, unknown>): Promise<void> {
        const user = (args.user as string).toLowerCase();
        const delta = BigInt(args.delta as bigint);
        await this.scoreRepo.upsertScore(user, delta);
    }

    private async handleEpochClosed(
        log: Log,
        args: Record<string, unknown>,
        tsCache: Map<bigint, Date>,
    ): Promise<void> {
        const txHash = (log.transactionHash ?? '').toLowerCase();
        const epochId = BigInt(args.epochId as bigint);
        const prizePool = BigInt(args.prizePool as bigint);
        const claimExpirySec = Number(args.claimExpiry as bigint);
        const closedAt = log.blockNumber !== null && log.blockNumber !== undefined
            ? tsCache.get(log.blockNumber) ?? new Date()
            : new Date();

        try {
            await this.epochRepo.markConfirmed({
                txHash,
                epochId,
                prizePool,
                claimExpiry: new Date(claimExpirySec * 1000),
                closedAt,
            });
            logger.info(`${this.indexerName}: epoch confirmed`, { epochId: epochId.toString(), txHash });
        } catch (err) {
            // Pending row may not exist (someone called closeEpoch via
            // Etherscan, bypassing the CLI). Fall back to insertPending with
            // empty leaves — claim banner ignores it because no proof is
            // reconstructable, but ops at least see the event in DB.
            logger.warn(`${this.indexerName}: no pending epoch row, inserting confirmed ghost`, {
                epochId: epochId.toString(),
                txHash,
                error: err instanceof Error ? err.message : String(err),
            });
            await this.epochRepo.insertPending({
                txHash,
                merkleRoot: (args.merkleRoot as string) ?? '0x',
                leaves: [],
            });
            await this.epochRepo.markConfirmed({
                txHash,
                epochId,
                prizePool,
                claimExpiry: new Date(claimExpirySec * 1000),
                closedAt,
            });
        }
    }

    private async handlePrizeClaimed(
        log: Log,
        args: Record<string, unknown>,
        tsCache: Map<bigint, Date>,
    ): Promise<void> {
        const epochId = BigInt(args.epochId as bigint);
        const user = (args.user as string).toLowerCase();
        const amount = BigInt(args.amount as bigint);
        const claimedAt = log.blockNumber !== null && log.blockNumber !== undefined
            ? tsCache.get(log.blockNumber) ?? new Date()
            : new Date();

        await this.claimRepo.insertIfAbsent({
            epochId,
            userAddress: user,
            amount,
            claimedAt,
            txHash: (log.transactionHash ?? '').toLowerCase(),
        });
    }

    private async handleEpochRolledOver(
        args: Record<string, unknown>,
        log: Log,
        tsCache: Map<bigint, Date>,
    ): Promise<void> {
        const epochId = BigInt(args.epochId as bigint);
        const rolledOver = BigInt(args.rolledOver as bigint);
        const ts = log.blockNumber !== null && log.blockNumber !== undefined
            ? tsCache.get(log.blockNumber) ?? new Date()
            : new Date();
        await this.epochRepo.markRolledOver(epochId, rolledOver, ts);
    }
}
