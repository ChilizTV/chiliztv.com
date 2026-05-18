import { z } from 'zod';

/**
 * Pool-global state served by `GET /pool/state`. Bigints are transported as
 * decimal strings because JSON has no native bigint type — the consumer
 * (frontend hook) decodes them via `BigInt(...)` back to native bigint.
 */
export const PoolStateBodySchema = z.object({
    totalAssets: z.string(),
    totalSupply: z.string(),
    freeBalance: z.string(),
    totalLiabilities: z.string(),
    utilization: z.string(),
    protocolFeeBps: z.number().int().nonnegative(),
    treasuryShareBps: z.number().int().nonnegative(),
    lpWithdrawalFeeBps: z.number().int().nonnegative(),
    maxBetAmount: z.string(),
    maxLiabilityPerMarketBps: z.number().int().nonnegative(),
    maxLiabilityPerMatchBps: z.number().int().nonnegative(),
    depositCooldownSeconds: z.number().int().nonnegative(),
    paused: z.boolean(),
    accruedTreasury: z.string(),
    treasury: z.string(),
    pendingTreasury: z.string(),
});
export type PoolStateBodyDto = z.infer<typeof PoolStateBodySchema>;

export const PoolStateResponseSchema = z.object({
    success: z.literal(true),
    state: PoolStateBodySchema,
    /** Server-side `Date.now()` at the moment the response was assembled. */
    timestamp: z.number(),
});
export type PoolStateResponseDto = z.infer<typeof PoolStateResponseSchema>;
