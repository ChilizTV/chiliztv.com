import {
    EpochClosedPatch,
    LeaderboardEpoch,
    NewLeaderboardEpochSeed,
} from '../entities/LeaderboardEpoch';

/**
 * Lifecycle of the per-epoch distribution row.
 *
 *  - `insertPending` is called by the CLI right after broadcasting `closeEpoch`.
 *    The row stays `status='pending'` until the indexer confirms.
 *  - `markConfirmed` is called by the LeaderboardIndexer when `EpochClosed`
 *    is observed; it backfills `epoch_id`, `prize_pool`, `claim_expiry`.
 *  - `markRolledOver` flips a confirmed epoch when `EpochRolledOver` lands.
 *  - `findClaimable` returns confirmed, non-expired epochs whose
 *    `leaves_json` contains the user — drives the claim banner UI.
 */
export interface ILeaderboardEpochRepository {
    insertPending(seed: NewLeaderboardEpochSeed): Promise<void>;

    markConfirmed(patch: EpochClosedPatch): Promise<void>;

    markRolledOver(
        epochId: bigint,
        rolledOver: bigint,
        rolledOverAt: Date,
    ): Promise<void>;

    /** Resolve by `(epochId)` — only matches confirmed rows. */
    findByEpochId(epochId: bigint): Promise<LeaderboardEpoch | null>;

    /** Confirmed, claim-window-still-open epochs in which the user has a leaf. */
    /** Confirmed epochs whose claim window is still open — eligibility is read on-chain (V2). */
    findOpenClaimWindows(now: Date): Promise<ReadonlyArray<LeaderboardEpoch>>;

    /**
     * `closed_at` of the most-recently confirmed epoch — the implicit start
     * of the currently-open epoch for downstream aggregations (e.g. "volume
     * staked this epoch"). Returns `null` when no epoch has closed yet.
     */
    findLatestConfirmedClosedAt(): Promise<Date | null>;

    /** Confirmed epochs whose claim window expired — rollover sweep candidates. */
    findExpiredConfirmed(now: Date): Promise<ReadonlyArray<LeaderboardEpoch>>;
}
