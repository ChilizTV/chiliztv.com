import { z } from 'zod';

export const ApyWindowSchema = z.enum(['7d', '30d']);
export type ApyWindow = z.infer<typeof ApyWindowSchema>;

export const ApySnapshotSchema = z.object({
    windowLabel: ApyWindowSchema,
    apyBps: z.number(),
    apyPostFeeBps: z.number().nullable(),
    periodDays: z.number().int().nonnegative(),
    noisy: z.boolean(),
    ppsStart: z.string(),
    ppsEnd: z.string(),
    blockStart: z.string(),
    blockEnd: z.string(),
    computedAt: z.string().datetime(),
});
export type ApySnapshotDto = z.infer<typeof ApySnapshotSchema>;

export const PoolApyResponseSchema = z.object({
    success: z.literal(true),
    apy7d: ApySnapshotSchema.nullable(),
    apy30d: ApySnapshotSchema.nullable(),
    timestamp: z.number(),
});
export type PoolApyResponseDto = z.infer<typeof PoolApyResponseSchema>;
