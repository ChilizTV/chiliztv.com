/**
 * Pipeline status of a leaderboard distribution epoch.
 *
 *  - pending      : CLI inserted the row after broadcasting closeEpoch but the
 *                   tx hasn't confirmed yet (ghost-resilient).
 *  - confirmed    : Indexer saw EpochClosed and filled epoch_id/prize_pool.
 *  - rolled_over  : Claim window expired and unspent USDC was rolled forward.
 *  - expired      : Claim window expired but no rollover seen yet (degenerate).
 */
export type LeaderboardEpochStatus = 'pending' | 'confirmed' | 'rolled_over' | 'expired';

/** One leaf in the merkle distribution — `(user, amount)` keccak'd twice. */
export interface LeaderboardLeaf {
    readonly userAddress: string;
    readonly amount: bigint;
}

/** Per-epoch snapshot persisted in `leaderboard_epochs`. */
export interface LeaderboardEpoch {
    readonly txHash: string;
    /** Null until the indexer confirms EpochClosed (CLI pre-INSERT). */
    readonly epochId: bigint | null;
    readonly merkleRoot: string;
    readonly prizePool: bigint | null;
    readonly claimExpiry: Date | null;
    readonly closedAt: Date | null;
    readonly rolledOver: bigint | null;
    readonly rolledOverAt: Date | null;
    readonly leaves: ReadonlyArray<LeaderboardLeaf>;
    readonly status: LeaderboardEpochStatus;
    readonly createdAt: Date;
}

/**
 * CLI-side seed used to INSERT a row in `pending` state before broadcasting
 * the `closeEpoch` tx. The indexer fills the rest on confirmation.
 */
export interface NewLeaderboardEpochSeed {
    readonly txHash: string;
    readonly merkleRoot: string;
    readonly leaves: ReadonlyArray<LeaderboardLeaf>;
}

/**
 * Patch applied by the indexer on `EpochClosed` — populates the fields the
 * contract computes itself (epochId, prizePool, claimExpiry, closedAt).
 */
export interface EpochClosedPatch {
    readonly txHash: string;
    readonly epochId: bigint;
    readonly prizePool: bigint;
    readonly claimExpiry: Date;
    readonly closedAt: Date;
}
