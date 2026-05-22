import { z } from 'zod';

/** One row in the top-N ladder. */
export const LeaderboardEntrySchema = z.object({
    rank: z.number().int().min(1),
    userAddress: z.string(),
    /** bigint decimal string — score units are USDC payouts won (6 dp). */
    totalScore: z.string(),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const LeaderboardTopDtoSchema = z.object({
    entries: z.array(LeaderboardEntrySchema),
    /** Snapshot of the current accumulating prize pool on the contract. */
    currentPrizePool: z.string(),
    /** Live epoch index (none yet → null before the first `closeEpoch`). */
    currentEpochId: z.number().int().nullable(),
    /**
     * Total USDC staked across every market since the previous epoch closed
     * (or all-time if no epoch has closed yet). Raw 6-decimal bigint string.
     */
    currentEpochVolume: z.string(),
});
export type LeaderboardTopDto = z.infer<typeof LeaderboardTopDtoSchema>;
