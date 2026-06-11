import { injectable, inject } from 'tsyringe';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { chainFor } from '@chiliztv/blockchain';
import { networkType } from '../../config/chiliz.config';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { IIndexerCheckpointRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IIndexerCheckpointRepository';
import { IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import { IMarketEventRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IMarketEventRepository';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import { Bet } from '@chiliztv/domain/blockchain-indexing/entities/Bet';
import { ChatMessage, MessageType } from '@chiliztv/domain/chat/entities/ChatMessage';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { IIncidentReporter } from '@chiliztv/domain/shared/ports/IIncidentReporter';
import { classifyStatus } from '@chiliztv/domain/matches/policies/BettablePolicy';
import { selectionToBetLabel } from '@chiliztv/domain/blockchain-indexing/policies/selectionToBetLabel';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { MarketPoolsCacheKeys } from '../../../application/matches/MarketPoolsCacheKeys';
import { BaseIndexer, DEFAULT_TAIL_OVERLAP_BLOCKS } from './BaseIndexer';
import { getTokenDecimals } from '../utils/getTokenDecimals';
import { marketTypeNameFromHash } from '../markets/marketTypeNameFromHash';

// PariMatchBase events. Names must match the ABI for viem `getLogs({events})`
// decoding to populate `log.eventName` and `log.args`.
const POSITION_TAKEN = parseAbiItem(
    'event PositionTaken(uint256 indexed marketId, address indexed user, uint64 outcome, uint256 stake, uint256 newOutcomePool, uint256 newTotalPool)',
);
const POSITION_CLAIMED = parseAbiItem(
    'event PositionClaimed(uint256 indexed marketId, address indexed user, uint256 stake, uint256 payout)',
);
const STAKE_REFUNDED = parseAbiItem(
    'event StakeRefunded(uint256 indexed marketId, address indexed user, uint256 amount)',
);
const MARKET_CREATED = parseAbiItem(
    'event MarketCreated(uint256 indexed marketId, bytes32 indexed marketType, int16 line, uint8 maxOutcome, uint16 groupId)',
);
const MARKET_STATE_CHANGED = parseAbiItem(
    'event MarketStateChanged(uint256 indexed marketId, uint8 oldState, uint8 newState)',
);
const MARKET_RESOLVED = parseAbiItem(
    'event MarketResolved(uint256 indexed marketId, uint64 result, uint256 totalPool, uint256 fee, uint256 resolvedNetPool)',
);
const MARKET_CANCELLED = parseAbiItem(
    'event MarketCancelled(uint256 indexed marketId, string reason)',
);
const LEADERBOARD_RECORD_FAILED = parseAbiItem(
    'event LeaderboardRecordFailed(address indexed leaderboard, address indexed user, uint256 payout)',
);

const ALL_EVENTS = [
    POSITION_TAKEN,
    POSITION_CLAIMED,
    STAKE_REFUNDED,
    MARKET_CREATED,
    MARKET_STATE_CHANGED,
    MARKET_RESOLVED,
    MARKET_CANCELLED,
    LEADERBOARD_RECORD_FAILED,
];

interface TeamJson {
    id: number;
    name: string;
    logo?: string;
}

interface MatchWithContract {
    id: number;
    api_football_id: number;
    status: string;
    home_team: TeamJson | string;
    away_team: TeamJson | string;
    match_date: string;
    betting_contract_address: string;
}

interface EventCoords {
    transactionHash: `0x${string}`;
    logIndex: number;
    blockNumber: bigint;
    blockTimestamp: Date;
}

/**
 * Indexes every event emitted by every PariMatch proxy registered in
 * `matches.betting_contract_address`.
 *
 *  - PositionTaken     → insert in `bets` (PENDING) + chat system message
 *  - PositionClaimed   → mark every user stake on the market as claimed + payout
 *  - StakeRefunded     → mark every user stake on the market as refund-claimed
 *  - MarketResolved    → bulk-update bets: outcome==result → WON, else → LOST
 *  - MarketCancelled   → bulk-update bets in market → REFUNDED
 *  - MarketCreated     → cache market context for label rendering
 *  - others            → audit-only into `market_events`
 *
 * Idempotent on (txHash, logIndex) — re-running the same range is a no-op.
 */
@injectable()
export class PariMatchEventIndexer extends BaseIndexer {
    private usdcDecimalsCache: number | null = null;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.IBetRepository)
        private readonly bets: IBetRepository,
        @inject(TOKENS.IMarketEventRepository)
        private readonly marketEvents: IMarketEventRepository,
        @inject(TOKENS.IChatRepository)
        private readonly chat: IChatRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
        @inject(TOKENS.IIncidentReporter)
        private readonly incidentReporter: IIncidentReporter,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
        @inject(TOKENS.ILockService)
        lockService: ILockService,
    ) {
        super({
            name: 'PariMatchEvent',
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
            lockService,
            // Handlers dedup on (tx_hash, log_index) before side effects — replay-safe.
            tailOverlapBlocks: DEFAULT_TAIL_OVERLAP_BLOCKS,
        });
    }

    protected async processBatch(fromBlock: bigint, toBlock: bigint): Promise<void> {
        const matches = await this.getBettingContracts();
        if (matches.length === 0) return;

        const addresses = matches.map((m) => m.betting_contract_address.toLowerCase() as `0x${string}`);

        const logs = await this.client.getLogs({
            address: addresses,
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
        const usdcDecimals = await this.getUsdcDecimals();

        for (const log of logs) {
            try {
                await this.dispatch(log, matches, blockTimestamps, usdcDecimals);
            } catch (err) {
                logger.error(`${this.indexerName}: failed to process log`, {
                    eventName: (log as { eventName?: string }).eventName,
                    txHash: log.transactionHash,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }

    private async dispatch(
        log: Log,
        matches: MatchWithContract[],
        blockTimestamps: Map<bigint, Date>,
        usdcDecimals: number,
    ): Promise<void> {
        const eventName = (log as { eventName?: string }).eventName;
        const args = (log as { args?: Record<string, unknown> }).args;
        if (!eventName || !args || !log.transactionHash || log.logIndex == null || log.blockNumber == null) {
            return;
        }
        // eslint-disable-next-line no-restricted-syntax -- block timestamp fallback when RPC misses
        const blockTimestamp = blockTimestamps.get(log.blockNumber) ?? new Date();
        const coords: EventCoords = {
            transactionHash: log.transactionHash as `0x${string}`,
            logIndex: log.logIndex,
            blockNumber: log.blockNumber,
            blockTimestamp,
        };
        const contractAddress = (log.address as string).toLowerCase();

        switch (eventName) {
            case 'PositionTaken':
                await this.handlePositionTaken(args as unknown as PositionTakenArgs, contractAddress, coords, matches, usdcDecimals);
                await this.invalidatePoolsCache(contractAddress);
                return;
            case 'PositionClaimed': {
                const a = args as { marketId: bigint; user: string; stake: bigint; payout: bigint };
                await this.bets.recordClaim(contractAddress, a.marketId, a.user, a.payout, blockTimestamp);
                return;
            }
            case 'StakeRefunded': {
                const a = args as { marketId: bigint; user: string; amount: bigint };
                // Refund is a claim against an already-Cancelled market.
                // cancelMarket already set status=REFUNDED on the rows; here we
                // stamp the claim by reusing recordClaim with the refund amount
                // as the "payout".
                await this.bets.recordClaim(contractAddress, a.marketId, a.user, a.amount, blockTimestamp);
                return;
            }
            case 'MarketResolved': {
                const a = args as { marketId: bigint; result: bigint; totalPool: bigint; fee: bigint; resolvedNetPool: bigint };
                await this.marketEvents.insertIfAbsent({
                    coordinates: coords,
                    contractAddress,
                    marketId: a.marketId,
                    eventName,
                    payload: {
                        result: a.result.toString(),
                        totalPool: a.totalPool.toString(),
                        fee: a.fee.toString(),
                        resolvedNetPool: a.resolvedNetPool.toString(),
                    },
                });
                await this.bets.settleMarket(contractAddress, a.marketId, a.result);
                await this.invalidatePoolsCache(contractAddress);
                return;
            }
            case 'MarketCancelled': {
                const a = args as { marketId: bigint; reason: string };
                await this.marketEvents.insertIfAbsent({
                    coordinates: coords,
                    contractAddress,
                    marketId: a.marketId,
                    eventName,
                    payload: { reason: a.reason },
                });
                await this.bets.cancelMarket(contractAddress, a.marketId);
                await this.invalidatePoolsCache(contractAddress);
                return;
            }
            case 'MarketCreated': {
                const a = args as { marketId: bigint; marketType: string; line: number; maxOutcome: number; groupId: number };
                // `a.marketType` is the bytes32 keccak256 hash from the event.
                // Resolve to friendly name ("WINNER", "GOALS_TOTAL", …) so the
                // dashboard + chat label can render without a reverse lookup.
                const friendlyName = marketTypeNameFromHash(a.marketType);
                await this.marketEvents.insertIfAbsent({
                    coordinates: coords,
                    contractAddress,
                    marketId: a.marketId,
                    eventName,
                    payload: {
                        marketType: friendlyName ?? a.marketType,
                        marketTypeHash: a.marketType,
                        line: a.line,
                        maxOutcome: a.maxOutcome,
                        maxSelections: a.maxOutcome + 1,
                        groupId: a.groupId,
                    },
                });
                return;
            }
            case 'MarketStateChanged': {
                const a = args as { marketId: bigint; oldState: number; newState: number };
                await this.marketEvents.insertIfAbsent({
                    coordinates: coords,
                    contractAddress,
                    marketId: a.marketId,
                    eventName,
                    payload: { oldState: a.oldState, newState: a.newState },
                });
                return;
            }
            case 'LeaderboardRecordFailed': {
                const a = args as { leaderboard: string; user: string; payout: bigint };
                logger.error(`${this.indexerName}: leaderboard recordWin failed`, {
                    contractAddress,
                    leaderboard: a.leaderboard,
                    user: a.user,
                    payout: a.payout.toString(),
                    txHash: coords.transactionHash,
                });
                await this.marketEvents.insertIfAbsent({
                    coordinates: coords,
                    contractAddress,
                    marketId: null,
                    eventName,
                    payload: {
                        leaderboard: a.leaderboard,
                        user: a.user,
                        payout: a.payout.toString(),
                    },
                });
                return;
            }
            default:
                return;
        }
    }

    private async handlePositionTaken(
        args: PositionTakenArgs,
        contractAddress: string,
        coords: EventCoords,
        matches: MatchWithContract[],
        usdcDecimals: number,
    ): Promise<void> {
        const bet: Bet = {
            coordinates: coords,
            contractAddress,
            marketId: args.marketId,
            userAddress: args.user,
            outcome: args.outcome,
            stakeAmount: args.stake,
            newOutcomePool: args.newOutcomePool,
            newTotalPool: args.newTotalPool,
            status: 'PENDING',
            payoutAmount: null,
            placedAt: coords.blockTimestamp,
            claimedAt: null,
        };

        const inserted = await this.bets.insertIfAbsent(bet);
        if (!inserted) {
            logger.info(`${this.indexerName}: PositionTaken skipped (already indexed)`, {
                txHash: coords.transactionHash,
                logIndex: coords.logIndex,
                contractAddress,
                marketId: args.marketId.toString(),
            });
            return;
        }

        const match = matches.find(
            (m) => m.betting_contract_address?.toLowerCase() === contractAddress,
        );
        if (!match) {
            logger.warn(`${this.indexerName}: PositionTaken for unknown contract`, { contractAddress });
            return;
        }

        await this.maybeReportLiveBetIncident(args, coords, match);

        const ctx = await this.marketEvents.findMarketContext(contractAddress, args.marketId);
        const label = selectionToBetLabel({
            marketType: ctx?.marketType ?? 'WINNER',
            selection: Number(args.outcome),
            line: ctx?.line ?? null,
            homeTeam: this.teamName(match.home_team),
            awayTeam: this.teamName(match.away_team),
        });

        logger.info(`${this.indexerName}: PositionTaken processed`, {
            txHash: coords.transactionHash,
            contractAddress,
            matchId: match.api_football_id,
            marketId: args.marketId.toString(),
            outcome: args.outcome.toString(),
            marketType: ctx?.marketType ?? null,
            label: label.display,
        });

        await this.postBetChatMessage(args, match, usdcDecimals, label);
    }

    private async maybeReportLiveBetIncident(
        args: PositionTakenArgs,
        coords: EventCoords,
        match: MatchWithContract,
    ): Promise<void> {
        const kind = classifyStatus(match.status);
        if (kind !== 'live' && kind !== 'blocked') return;

        const ageMs = this.clock.now().getTime() - coords.blockTimestamp.getTime();
        if (ageMs > 60 * 60_000) {
            logger.debug(`${this.indexerName}: skip live_bet_incident on stale block`, {
                txHash: coords.transactionHash, ageMs,
            });
            return;
        }

        try {
            await this.incidentReporter.reportLiveBetIncident({
                txHash: coords.transactionHash,
                blockNumber: Number(coords.blockNumber),
                blockTimestamp: coords.blockTimestamp,
                user: args.user,
                amount: args.stake.toString(),
                contractAddress: match.betting_contract_address,
                marketId: Number(args.marketId),
                matchId: match.id ?? null,
                matchStatus: match.status,
            });
        } catch (err) {
            logger.warn(`${this.indexerName}: incident reporter failed`, {
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }

    private async postBetChatMessage(
        args: PositionTakenArgs,
        match: MatchWithContract,
        usdcDecimals: number,
        label: { subType: string; display: string },
    ): Promise<void> {
        const formatted = (Number(args.stake) / 10 ** usdcDecimals).toFixed(2);
        try {
            const message = ChatMessage.create({
                matchId: match.api_football_id,
                userId: 'system',
                walletAddress: 'system',
                username: 'System',
                message: `New position: ${formatted} USDC on ${label.display}`,
                type: MessageType.SYSTEM,
                systemType: 'bet',
                isFeatured: false,
            });
            const saved = await this.chat.saveMessage(message);
            logger.info(`${this.indexerName}: bet chat message inserted`, {
                matchId: match.api_football_id,
                messageId: saved.getId() ?? null,
                stake: formatted,
                label: label.display,
            });
        } catch (err) {
            logger.error(`${this.indexerName}: failed to insert bet chat message`, {
                matchId: match.api_football_id,
                stake: formatted,
                label: label.display,
                error: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
            });
        }
    }

    private async getBettingContracts(): Promise<MatchWithContract[]> {
        const { data, error } = await supabase
            .from('matches')
            .select('id, api_football_id, status, home_team, away_team, match_date, betting_contract_address')
            .not('betting_contract_address', 'is', null);
        if (error || !data?.length) return [];
        return data as MatchWithContract[];
    }

    private teamName(team: TeamJson | string): string {
        if (typeof team === 'string') return team;
        return team.name ?? 'Unknown';
    }

    private async invalidatePoolsCache(contractAddress: string): Promise<void> {
        // Drop the cached snapshot so the next /matches/:address/pools call
        // hits the multicall. Redis pub/sub fanout (built into the cache
        // service) propagates to other backend instances.
        await this.cache.delete(MarketPoolsCacheKeys.forAddress(contractAddress));
    }

    private async getUsdcDecimals(): Promise<number> {
        if (this.usdcDecimalsCache !== null) return this.usdcDecimalsCache;
        if (!this.network.usdcAddress) {
            this.usdcDecimalsCache = 6;
            return 6;
        }
        const decimals = await getTokenDecimals(this.client, this.network.usdcAddress as `0x${string}`);
        this.usdcDecimalsCache = decimals;
        return decimals;
    }
}

interface PositionTakenArgs {
    marketId: bigint;
    user: string;
    outcome: bigint;
    stake: bigint;
    newOutcomePool: bigint;
    newTotalPool: bigint;
}
