import { z } from 'zod';

/** Query params for the offset-paged aggregate listings (players/streamers). */
export const AdminAggregatePageQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(25),
    offset: z.coerce.number().int().min(0).default(0),
});
export type AdminAggregatePageQuery = z.infer<typeof AdminAggregatePageQuerySchema>;

/** Raw USDC 6dp decimal strings — the UI formats them. */
export const AdminPlayerDtoSchema = z.object({
    wallet: z.string(),
    username: z.string().nullable(),
    betCount: z.number(),
    totalStaked: z.string(),
    totalPayout: z.string(),
    wonCount: z.number(),
    lostCount: z.number(),
    pendingCount: z.number(),
    lastBetAt: z.string().nullable(),
});
export type AdminPlayerDto = z.infer<typeof AdminPlayerDtoSchema>;

export const AdminStreamerDtoSchema = z.object({
    wallet: z.string(),
    donationCount: z.number(),
    donationTotal: z.string(),
    subCount: z.number(),
    subRevenue: z.string(),
    lastActivityAt: z.string().nullable(),
});
export type AdminStreamerDto = z.infer<typeof AdminStreamerDtoSchema>;

export const AdminMatchSummaryDtoSchema = z.object({
    id: z.number(),
    homeTeamName: z.string(),
    homeTeamLogo: z.string().nullable(),
    awayTeamName: z.string(),
    awayTeamLogo: z.string().nullable(),
    leagueName: z.string(),
    status: z.string(),
    matchDate: z.string(),
    score: z.object({ home: z.number(), away: z.number() }).nullable(),
    bettingContractAddress: z.string().nullable(),
    betCount: z.number(),
    totalStaked: z.string(),
});
export type AdminMatchSummaryDto = z.infer<typeof AdminMatchSummaryDtoSchema>;
