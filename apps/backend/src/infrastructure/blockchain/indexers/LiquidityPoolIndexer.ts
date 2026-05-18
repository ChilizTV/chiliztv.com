import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../config/chiliz.config';
import { logger } from '../../logging/logger';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import { IPoolEventRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IPoolEventRepository';
import { ILpPositionRepository } from '@chiliztv/domain/blockchain-indexing/repositories/ILpPositionRepository';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { BaseIndexer } from './BaseIndexer';

const DEPOSIT_EVENT = parseAbiItem(
    'event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)',
);
const WITHDRAW_EVENT = parseAbiItem(
    'event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
);
const BET_RECORDED = parseAbiItem(
    'event BetRecorded(address indexed bettingMatch, uint256 indexed marketId, address indexed bettor, uint256 netStake, uint256 netExposure)',
);
const MARKET_SETTLED = parseAbiItem(
    'event MarketSettled(address indexed bettingMatch, uint256 indexed marketId, uint256 releasedLiability)',
);
const WINNER_PAID = parseAbiItem(
    'event WinnerPaid(address indexed bettingMatch, uint256 indexed marketId, address indexed to, uint256 payout)',
);
const REFUND_PAID = parseAbiItem(
    'event RefundPaid(address indexed bettingMatch, uint256 indexed marketId, address indexed to, uint256 stake, uint256 releasedLiability)',
);
const TREASURY_ACCRUED = parseAbiItem(
    'event TreasuryAccrued(address indexed bettingMatch, uint256 indexed marketId, uint256 losingNetStake, uint256 treasuryShare)',
);
const LP_WITHDRAWAL_FEE_ACCRUED = parseAbiItem(
    'event LpWithdrawalFeeAccrued(address indexed owner, uint256 gain, uint256 fee)',
);
const TREASURY_PROPOSED = parseAbiItem(
    'event TreasuryProposed(address indexed proposer, address indexed pending)',
);
const TREASURY_PROPOSAL_CANCELLED = parseAbiItem(
    'event TreasuryProposalCancelled(address indexed pending)',
);
const TREASURY_ACCEPTED = parseAbiItem(
    'event TreasuryAccepted(address indexed oldTreasury, address indexed newTreasury)',
);
const TREASURY_WITHDRAWN = parseAbiItem(
    'event TreasuryWithdrawn(address indexed to, uint256 amount)',
);
const MATCH_AUTHORIZED = parseAbiItem('event MatchAuthorized(address indexed bettingMatch)');
const MATCH_REVOKED = parseAbiItem('event MatchRevoked(address indexed bettingMatch)');
const PAUSED = parseAbiItem('event Paused(address account)');
const UNPAUSED = parseAbiItem('event Unpaused(address account)');
const TREASURY_SHARE_BPS_SET = parseAbiItem('event TreasuryShareBpsSet(uint16 oldBps, uint16 newBps)');
const LP_WITHDRAWAL_FEE_BPS_SET = parseAbiItem('event LpWithdrawalFeeBpsSet(uint16 oldBps, uint16 newBps)');
const MAX_BET_AMOUNT_SET = parseAbiItem('event MaxBetAmountSet(uint256 oldMax, uint256 newMax)');
const MAX_LIABILITY_PER_MARKET_SET = parseAbiItem('event MaxLiabilityPerMarketSet(uint16 oldBps, uint16 newBps)');
const MAX_LIABILITY_PER_MATCH_SET = parseAbiItem('event MaxLiabilityPerMatchSet(uint16 oldBps, uint16 newBps)');
const DEPOSIT_COOLDOWN_SET = parseAbiItem('event DepositCooldownSet(uint48 oldSeconds, uint48 newSeconds)');
const PROTOCOL_FEE_SET = parseAbiItem('event ProtocolFeeSet(uint16 oldBps, uint16 newBps)');

const ALL_EVENTS = [
    DEPOSIT_EVENT,
    WITHDRAW_EVENT,
    BET_RECORDED,
    MARKET_SETTLED,
    WINNER_PAID,
    REFUND_PAID,
    TREASURY_ACCRUED,
    LP_WITHDRAWAL_FEE_ACCRUED,
    TREASURY_PROPOSED,
    TREASURY_PROPOSAL_CANCELLED,
    TREASURY_ACCEPTED,
    TREASURY_WITHDRAWN,
    MATCH_AUTHORIZED,
    MATCH_REVOKED,
    PAUSED,
    UNPAUSED,
    TREASURY_SHARE_BPS_SET,
    LP_WITHDRAWAL_FEE_BPS_SET,
    MAX_BET_AMOUNT_SET,
    MAX_LIABILITY_PER_MARKET_SET,
    MAX_LIABILITY_PER_MATCH_SET,
    DEPOSIT_COOLDOWN_SET,
    PROTOCOL_FEE_SET,
];

/**
 * Indexes every event emitted by the LiquidityPool proxy. Two responsibilities:
 *  - Audit log into `pool_events` (every event, full payload as jsonb)
 *  - LP position bookkeeping (Deposit / Withdraw → `lp_positions.applyDelta`)
 *
 * The APY job (Lot 3) reads from `pool_events` for MarketSettled aggregates
 * and from `lp_positions` for cost-basis-aware unrealized gain.
 */
@injectable()
export class LiquidityPoolIndexer extends BaseIndexer {
    private readonly poolAddress: `0x${string}`;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.IPoolEventRepository)
        private readonly poolEvents: IPoolEventRepository,
        @inject(TOKENS.ILpPositionRepository)
        private readonly lpPositions: ILpPositionRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
        @inject(TOKENS.ILockService)
        lockService: ILockService,
    ) {
        const poolAddress = network.liquidityPoolAddress as `0x${string}`;
        super({
            name: 'LiquidityPool',
            contractAddress: poolAddress,
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
            lockService,
        });
        this.poolAddress = poolAddress;
    }

    protected async processBatch(fromBlock: bigint, toBlock: bigint): Promise<void> {
        const logs = await this.client.getLogs({
            address: this.poolAddress,
            events: ALL_EVENTS,
            fromBlock,
            toBlock,
        });
        if (logs.length === 0) return;

        logger.info(`${this.indexerName}: ${logs.length} log(s) in range`, {
            fromBlock: fromBlock.toString(),
            toBlock: toBlock.toString(),
        });

        const blockTimestamps = await this.resolveBlockTimestamps(logs);

        for (const log of logs) {
            try {
                await this.dispatch(log, blockTimestamps);
            } catch (err) {
                logger.error(`${this.indexerName}: failed to process log`, {
                    eventName: (log as { eventName?: string }).eventName,
                    txHash: log.transactionHash,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }

    private async dispatch(log: Log, blockTimestamps: Map<bigint, Date>): Promise<void> {
        const eventName = (log as { eventName?: string }).eventName;
        const args = (log as { args?: Record<string, unknown> }).args;
        if (!eventName || !args || !log.transactionHash || log.logIndex == null || log.blockNumber == null) {
            return;
        }
        // eslint-disable-next-line no-restricted-syntax -- indexer block timestamp fallback
        const blockTimestamp = blockTimestamps.get(log.blockNumber) ?? new Date();
        const coords = {
            transactionHash: log.transactionHash as `0x${string}`,
            logIndex: log.logIndex,
            blockNumber: log.blockNumber,
            blockTimestamp,
        };
        const contractAddress = this.poolAddress;

        // Audit: every event lands in pool_events (payload = serialized args).
        await this.poolEvents.insertIfAbsent({
            coordinates: coords,
            contractAddress,
            eventName,
            payload: serialize(args),
        });

        // LP position bookkeeping for ERC4626 cash flows.
        if (eventName === 'Deposit') {
            const a = args as unknown as { sender: string; owner: string; assets: bigint; shares: bigint };
            await this.lpPositions.applyDelta({
                holder: a.owner,
                sharesDelta: a.shares,
                costBasisDelta: a.assets,
                bumpLastDepositAt: blockTimestamp,
                updatedAt: blockTimestamp,
            });
        } else if (eventName === 'Withdraw') {
            const a = args as unknown as { sender: string; receiver: string; owner: string; assets: bigint; shares: bigint };
            const existing = await this.lpPositions.findByHolder(a.owner);
            if (existing && existing.shares > BigInt(0)) {
                // Cost basis is reduced proportionally to the share burn —
                // mirrors the contract's `_update` accounting on withdrawals.
                const costBasisOut = (existing.costBasis * a.shares) / existing.shares;
                await this.lpPositions.applyDelta({
                    holder: a.owner,
                    sharesDelta: -a.shares,
                    costBasisDelta: -costBasisOut,
                    updatedAt: blockTimestamp,
                });
            } else {
                await this.lpPositions.applyDelta({
                    holder: a.owner,
                    sharesDelta: -a.shares,
                    costBasisDelta: BigInt(0),
                    updatedAt: blockTimestamp,
                });
            }
        }
    }
}

/**
 * Recursively converts a viem-decoded args object into a JSON-safe payload:
 * bigints become strings, addresses are lowercased.
 */
function serialize(value: unknown): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (typeof val === 'bigint') {
            out[key] = val.toString();
        } else if (typeof val === 'string' && val.startsWith('0x') && val.length === 42) {
            out[key] = val.toLowerCase();
        } else {
            out[key] = val;
        }
    }
    return out;
}
