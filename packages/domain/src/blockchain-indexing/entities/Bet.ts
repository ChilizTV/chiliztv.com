import { EventCoordinates } from '../value-objects/EventCoordinates';

export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';

/**
 * On-chain bookkeeping of a single `PositionTaken` event from PariMatchBase.
 *
 * In the parimutuel model each row records a single stake placed by a user
 * on a market+outcome at a point in time. Cumulative stake per outcome is
 * obtained by summing rows; the contract itself maintains the aggregate in
 * `_userStake[marketId][user][outcome]`. Payout/refund updates land on the
 * winning rows when the user claims (one claim covers all their stakes on
 * the winning outcome — the contract reads the cumulative).
 */
export interface Bet {
    readonly coordinates: EventCoordinates;
    readonly contractAddress: string;
    readonly marketId: bigint;
    readonly userAddress: string;
    /** uint64 outcome index (0..maxOutcome). */
    readonly outcome: bigint;
    /** USDC amount staked at this event. */
    readonly stakeAmount: bigint;
    /** Outcome pool after this stake was applied (snapshot for UI history). */
    readonly newOutcomePool: bigint;
    /** Total market pool after this stake was applied. */
    readonly newTotalPool: bigint;
    readonly status: BetStatus;
    /** Filled by the indexer when the user claims a winning bet (Resolved markets). */
    readonly payoutAmount: bigint | null;
    readonly placedAt: Date;
    readonly claimedAt: Date | null;
}

export interface BetUpdate {
    readonly status?: BetStatus;
    readonly payoutAmount?: bigint | null;
    readonly claimedAt?: Date | null;
}
