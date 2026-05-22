/** Per-user cumulative score, sourced from on-chain `WinRecorded` events. */
export interface LeaderboardScore {
    readonly userAddress: string;
    readonly totalScore: bigint;
    readonly updatedAt: Date;
}

/** Score row enriched with the user's current rank in the global ladder. */
export interface LeaderboardScoreWithRank extends LeaderboardScore {
    readonly rank: number;
}
