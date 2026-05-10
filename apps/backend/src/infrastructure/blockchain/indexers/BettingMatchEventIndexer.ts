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
import { IPredictionRepository } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import { Bet } from '@chiliztv/domain/blockchain-indexing/entities/Bet';
import { Prediction } from '@chiliztv/domain/predictions/entities/Prediction';
import { TransactionHash } from '@chiliztv/domain/predictions/value-objects/TransactionHash';
import { Odds } from '@chiliztv/domain/predictions/value-objects/Odds';
import { PredictionStatus } from '@chiliztv/domain/predictions/value-objects/PredictionStatus';
import { ChatMessage, MessageType } from '@chiliztv/domain/chat/entities/ChatMessage';
import { BaseIndexer } from './BaseIndexer';
import { getTokenDecimals } from '../utils/getTokenDecimals';

const BET_PLACED = parseAbiItem(
    'event BetPlaced(uint256 indexed marketId, address indexed user, uint256 betIndex, uint256 amount, uint64 selection, uint32 odds, uint16 oddsIndex)',
);
const PAYOUT = parseAbiItem(
    'event Payout(uint256 indexed marketId, address indexed user, uint256 betIndex, uint256 amount)',
);
const REFUND = parseAbiItem(
    'event Refund(uint256 indexed marketId, address indexed user, uint256 betIndex, uint256 amount)',
);
const MARKET_CREATED = parseAbiItem(
    'event MarketCreated(uint256 indexed marketId, string marketType, uint32 initialOdds)',
);
const MARKET_STATE_CHANGED = parseAbiItem(
    'event MarketStateChanged(uint256 indexed marketId, uint8 oldState, uint8 newState)',
);
const ODDS_UPDATED = parseAbiItem(
    'event OddsUpdated(uint256 indexed marketId, uint32 oldOdds, uint32 newOdds, uint16 oddsIndex)',
);
const MARKET_RESOLVED = parseAbiItem(
    'event MarketResolved(uint256 indexed marketId, uint64 result, uint40 resolvedAt)',
);
const MARKET_CANCELLED = parseAbiItem(
    'event MarketCancelled(uint256 indexed marketId, string reason)',
);

const ALL_EVENTS = [
    BET_PLACED,
    PAYOUT,
    REFUND,
    MARKET_CREATED,
    MARKET_STATE_CHANGED,
    ODDS_UPDATED,
    MARKET_RESOLVED,
    MARKET_CANCELLED,
];

interface TeamJson {
    id: number;
    name: string;
    logo?: string;
}

interface MatchWithContract {
    api_football_id: number;
    home_team: TeamJson | string;
    away_team: TeamJson | string;
    match_date: string;
    betting_contract_address: string;
    odds?: { match_winner?: { home?: number; draw?: number; away?: number } } | null;
}

interface EventCoords {
    transactionHash: `0x${string}`;
    logIndex: number;
    blockNumber: bigint;
    blockTimestamp: Date;
}

/**
 * Indexes every event emitted by every BettingMatch contract registered in
 * the `matches.betting_contract_address` column. Replaces the legacy
 * BettingEventIndexer (which only listened to BetPlaced).
 *
 *  - BetPlaced       → insert in `bets` (PENDING) + mirror in `predictions` (legacy compat) + chat system message
 *  - Payout          → mark the matching bet WON + claimed
 *  - Refund          → mark the matching bet REFUNDED
 *  - MarketResolved  → bulk-update bets in market: WON/LOST + write `market_events`
 *  - MarketCancelled → bulk-update bets in market: REFUNDED + write `market_events`
 *  - others          → audit-only into `market_events`
 *
 * Idempotent on (txHash, logIndex) — re-running the same range is a no-op.
 */
@injectable()
export class BettingMatchEventIndexer extends BaseIndexer {
    private usdcDecimalsCache: number | null = null;

    constructor(
        @inject(TOKENS.IIndexerCheckpointRepository)
        checkpoints: IIndexerCheckpointRepository,
        @inject(TOKENS.IBetRepository)
        private readonly bets: IBetRepository,
        @inject(TOKENS.IMarketEventRepository)
        private readonly marketEvents: IMarketEventRepository,
        @inject(TOKENS.IPredictionRepository)
        private readonly predictions: IPredictionRepository,
        @inject(TOKENS.IChatRepository)
        private readonly chat: IChatRepository,
        @inject(TOKENS.INetworkConfig)
        private readonly network: INetworkConfig,
    ) {
        super({
            name: 'BettingMatchEvent',
            client: createPublicClient({
                chain: chainFor(networkType),
                transport: http(network.rpcUrl),
            }),
            checkpoints,
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
        const blockTimestamp = blockTimestamps.get(log.blockNumber) ?? new Date();
        const coords: EventCoords = {
            transactionHash: log.transactionHash as `0x${string}`,
            logIndex: log.logIndex,
            blockNumber: log.blockNumber,
            blockTimestamp,
        };
        const contractAddress = (log.address as string).toLowerCase();

        switch (eventName) {
            case 'BetPlaced':
                await this.handleBetPlaced(args as unknown as BetPlacedArgs, contractAddress, coords, matches, usdcDecimals);
                return;
            case 'Payout': {
                const a = args as { marketId: bigint; user: string; betIndex: bigint; amount: bigint };
                await this.bets.updateByCoordinates(contractAddress, a.marketId, a.betIndex, a.user, {
                    status: 'WON',
                    payout: a.amount,
                    claimedAt: blockTimestamp,
                });
                return;
            }
            case 'Refund': {
                const a = args as { marketId: bigint; user: string; betIndex: bigint; amount: bigint };
                await this.bets.updateByCoordinates(contractAddress, a.marketId, a.betIndex, a.user, {
                    status: 'REFUNDED',
                    refundAmount: a.amount,
                    refundedAt: blockTimestamp,
                });
                return;
            }
            case 'MarketResolved': {
                const a = args as { marketId: bigint; result: bigint; resolvedAt: number };
                await this.marketEvents.insertIfAbsent({
                    coordinates: coords,
                    contractAddress,
                    marketId: a.marketId,
                    eventName,
                    payload: { result: a.result.toString(), resolvedAt: Number(a.resolvedAt) },
                });
                await this.bets.settleMarket(contractAddress, a.marketId, a.result, blockTimestamp);
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
                await this.bets.cancelMarket(contractAddress, a.marketId, blockTimestamp);
                return;
            }
            case 'MarketCreated': {
                const a = args as { marketId: bigint; marketType: string; initialOdds: number };
                // The MarketCreated event doesn't include `line`. We do a one-off
                // read of `getFootballMarket(marketId)` here so the front can
                // render line-aware labels (Over 2.5 goals) for GOALS_TOTAL bets.
                let line: number | null = null;
                try {
                    const result = await this.client.readContract({
                        address: contractAddress as `0x${string}`,
                        abi: [
                            parseAbiItem(
                                'function getFootballMarket(uint256) view returns (string,int16,uint8,uint8,uint32,uint64,uint256)',
                            ),
                        ],
                        functionName: 'getFootballMarket',
                        args: [a.marketId],
                    }) as readonly [string, number, number, number, number, bigint, bigint];
                    line = Number(result[1]);
                } catch (err) {
                    // Basketball matches don't expose getFootballMarket — that's fine,
                    // line stays null. Same for read errors against non-FootballMatch contracts.
                    logger.debug('getFootballMarket read failed (likely non-football)', {
                        contractAddress,
                        marketId: a.marketId.toString(),
                        error: err instanceof Error ? err.message : String(err),
                    });
                }
                await this.marketEvents.insertIfAbsent({
                    coordinates: coords,
                    contractAddress,
                    marketId: a.marketId,
                    eventName,
                    payload: { marketType: a.marketType, initialOdds: a.initialOdds, line },
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
            case 'OddsUpdated': {
                const a = args as { marketId: bigint; oldOdds: number; newOdds: number; oddsIndex: number };
                await this.marketEvents.insertIfAbsent({
                    coordinates: coords,
                    contractAddress,
                    marketId: a.marketId,
                    eventName,
                    payload: { oldOdds: a.oldOdds, newOdds: a.newOdds, oddsIndex: a.oddsIndex },
                });
                return;
            }
            default:
                return;
        }
    }

    private async handleBetPlaced(
        args: BetPlacedArgs,
        contractAddress: string,
        coords: EventCoords,
        matches: MatchWithContract[],
        usdcDecimals: number,
    ): Promise<void> {
        const bet: Bet = {
            coordinates: coords,
            contractAddress,
            marketId: args.marketId,
            betIndex: args.betIndex,
            userAddress: args.user,
            selection: args.selection,
            netStake: args.amount,
            grossStake: args.amount, // protocol fee currently 0 → gross = net
            oddsX10000: args.odds,
            oddsIndex: args.oddsIndex,
            status: 'PENDING',
            payout: null,
            refundAmount: null,
            placedAt: coords.blockTimestamp,
            resolvedAt: null,
            claimedAt: null,
            refundedAt: null,
        };

        const inserted = await this.bets.insertIfAbsent(bet);
        if (!inserted) return;

        const match = matches.find(
            (m) => m.betting_contract_address?.toLowerCase() === contractAddress,
        );
        if (!match) {
            logger.warn(`${this.indexerName}: BetPlaced for unknown contract`, { contractAddress });
            return;
        }

        await this.mirrorToPredictionsTable(args, coords, match, usdcDecimals);
        await this.postBetChatMessage(args, match, usdcDecimals);
    }

    /**
     * Legacy mirror: writes a row to `predictions` so the existing UI keeps
     * showing on-chain bets. Skipped if a matching tx_hash row already exists
     * (avoids duplicate on the API-direct path that creates predictions before
     * the tx is mined).
     */
    private async mirrorToPredictionsTable(
        args: BetPlacedArgs,
        coords: EventCoords,
        match: MatchWithContract,
        usdcDecimals: number,
    ): Promise<void> {
        const txHash = TransactionHash.create(coords.transactionHash);
        const existing = await this.predictions.findByTransactionHash(txHash);
        if (existing) return;

        const { subType, team } = this.selectionToPrediction(Number(args.selection), match);
        const oddsValue = Math.max(1.01, Number(args.odds) / 10000);
        const username = await this.getUsernameForWallet(args.user)
            ?? `${args.user.slice(0, 6)}...${args.user.slice(-4)}`;

        const prediction = Prediction.reconstitute({
            id: crypto.randomUUID(),
            userId: 'wallet:' + args.user.toLowerCase(),
            walletAddress: args.user.toLowerCase(),
            username,
            matchId: match.api_football_id,
            matchName: `${this.teamName(match.home_team)} vs ${this.teamName(match.away_team)}`,
            predictionType: 'match_winner',
            predictionValue: subType,
            predictedTeam: team,
            odds: Odds.create(oddsValue),
            status: PredictionStatus.PENDING,
            transactionHash: txHash,
            placedAt: coords.blockTimestamp,
            matchStartTime: new Date(match.match_date),
            createdAt: coords.blockTimestamp,
            updatedAt: coords.blockTimestamp,
        });
        try {
            await this.predictions.save(prediction);
        } catch (err) {
            // Race against the API-direct flow: if a row was created between
            // our SELECT and INSERT, ignore the duplicate-key error.
            logger.debug(`${this.indexerName}: prediction mirror skipped`, {
                txHash: coords.transactionHash,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }

    private async postBetChatMessage(
        args: BetPlacedArgs,
        match: MatchWithContract,
        usdcDecimals: number,
    ): Promise<void> {
        const { subType, team } = this.selectionToPrediction(Number(args.selection), match);
        const formatted = (Number(args.amount) / 10 ** usdcDecimals).toFixed(2);
        try {
            const message = ChatMessage.create({
                matchId: match.api_football_id,
                userId: 'system',
                walletAddress: 'system',
                username: 'System',
                message: `🎯 New prediction: ${formatted} USDC on ${team || subType}`,
                type: MessageType.SYSTEM,
                systemType: 'bet',
                isFeatured: false,
            });
            await this.chat.saveMessage(message);
        } catch (err) {
            logger.error(`${this.indexerName}: failed to insert bet chat message`, {
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }

    private async getUsernameForWallet(walletAddress: string): Promise<string | null> {
        const addr = walletAddress.toLowerCase();
        try {
            const { data: chatRows } = await supabase
                .from('chat_messages')
                .select('username')
                .eq('wallet_address', addr)
                .order('created_at', { ascending: false })
                .limit(1);
            if (chatRows?.[0]?.username) return chatRows[0].username;

            const { data: predRows } = await supabase
                .from('predictions')
                .select('username')
                .eq('wallet_address', addr)
                .order('placed_at', { ascending: false })
                .limit(1);
            return predRows?.[0]?.username ?? null;
        } catch {
            return null;
        }
    }

    private async getBettingContracts(): Promise<MatchWithContract[]> {
        const { data, error } = await supabase
            .from('matches')
            .select('api_football_id, home_team, away_team, match_date, betting_contract_address, odds')
            .not('betting_contract_address', 'is', null);
        if (error || !data?.length) return [];
        return data as MatchWithContract[];
    }

    private selectionToPrediction(selection: number, match: MatchWithContract): { subType: string; team: string } {
        const homeName = this.teamName(match.home_team);
        const awayName = this.teamName(match.away_team);
        switch (selection) {
            case 0: return { subType: 'home', team: homeName };
            case 1: return { subType: 'draw', team: 'Draw' };
            case 2: return { subType: 'away', team: awayName };
            default: return { subType: `selection-${selection}`, team: `Selection ${selection}` };
        }
    }

    private teamName(team: TeamJson | string): string {
        if (typeof team === 'string') return team;
        return team.name ?? 'Unknown';
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

interface BetPlacedArgs {
    marketId: bigint;
    user: string;
    betIndex: bigint;
    amount: bigint;
    selection: bigint;
    odds: number;
    oddsIndex: number;
}
