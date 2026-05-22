import { Bet, BetUpdate } from '../entities/Bet';
import { BetWithMatchInfo } from '../entities/BetWithMatchInfo';

/**
 * Semantic filter for the my-bets feed. `claimable` = WON & no claim row,
 * `refundable` = REFUNDED & no claim row.
 */
export type BetFilter = 'all' | 'pending' | 'won' | 'lost' | 'refunded' | 'claimable' | 'refundable';

export interface BetCounts {
    readonly all: number;
    readonly pending: number;
    readonly won: number;
    readonly lost: number;
    readonly refunded: number;
    readonly claimable: number;
    readonly refundable: number;
}

export interface FindBetsByUserOptions {
    readonly limit: number;
    readonly offset: number;
    readonly filter?: BetFilter;
}

/**
 * Parimutuel `bets` table — one row per `PositionTaken` event.
 *
 *  - INSERT idempotent par `(tx_hash, log_index)`
 *  - `settleMarket` bulk-UPDATE: outcome == winning → WON, else → LOST
 *  - `cancelMarket` bulk-UPDATE: tous les rows → REFUNDED
 *  - `recordClaim` marque les rows du user comme claimed (un PositionClaimed
 *    couvre tous les stakes du user sur l'outcome gagnant)
 */
export interface IBetRepository {
    insertIfAbsent(bet: Bet): Promise<boolean>;

    settleMarket(
        contractAddress: string,
        marketId: bigint,
        winningOutcome: bigint,
    ): Promise<{ won: number; lost: number }>;

    cancelMarket(
        contractAddress: string,
        marketId: bigint,
    ): Promise<number>;

    /**
     * Marks every stake the user holds on `(contractAddress, marketId)` as
     * claimed and stamps the total payout. A single `PositionClaimed` event
     * covers all the user's stakes on the winning outcome.
     */
    recordClaim(
        contractAddress: string,
        marketId: bigint,
        userAddress: string,
        payoutAmount: bigint,
        claimedAt: Date,
    ): Promise<number>;

    /** Generic update for re-org compensation or admin corrections. */
    updateByCoordinates(
        contractAddress: string,
        marketId: bigint,
        userAddress: string,
        update: BetUpdate,
    ): Promise<boolean>;

    findByUser(userAddress: string, options: FindBetsByUserOptions): Promise<Bet[]>;
    countByUser(userAddress: string, filter?: BetFilter): Promise<number>;
    countByUserStatuses(userAddress: string): Promise<BetCounts>;
    findByUserWithMatchInfo(userAddress: string, options: FindBetsByUserOptions): Promise<BetWithMatchInfo[]>;
    listReferencedContractAddresses(): Promise<ReadonlySet<string>>;

    /**
     * SUM(stake_amount) across every bet posted on/after `since`. Drives the
     * "volume staked this epoch" stat on the discover hero — caller passes
     * the latest confirmed `EpochClosed.closed_at`, or Unix epoch for the
     * all-time fallback when no epoch has closed yet.
     */
    sumStakeAmountSince(since: Date): Promise<bigint>;
}
