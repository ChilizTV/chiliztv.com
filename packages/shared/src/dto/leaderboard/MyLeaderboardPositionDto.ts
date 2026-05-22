import { z } from 'zod';

export const MyLeaderboardPositionDtoSchema = z.object({
    userAddress: z.string(),
    /** 1-based rank, or null if the user has no score yet. */
    rank: z.number().int().min(1).nullable(),
    totalScore: z.string(),
});
export type MyLeaderboardPositionDto = z.infer<typeof MyLeaderboardPositionDtoSchema>;
