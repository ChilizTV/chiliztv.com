import { z } from 'zod';

export const AdminReviewReportSchema = z.object({
    note: z.string().trim().max(500).optional(),
});
export type AdminReviewReportDto = z.infer<typeof AdminReviewReportSchema>;

export const AdminCreateBanSchema = z.object({
    walletAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
    reason: z.string().trim().min(10).max(500),
    /** Hours (1..8784), null = permanent, omitted = escalation policy. */
    durationHours: z.number().int().min(1).max(8784).nullable().optional(),
});
export type AdminCreateBanDto = z.infer<typeof AdminCreateBanSchema>;

export const AdminLiftBanSchema = z.object({
    note: z.string().trim().min(1).max(500),
});
export type AdminLiftBanDto = z.infer<typeof AdminLiftBanSchema>;

export const AdminReverseActionSchema = z.object({
    note: z.string().trim().max(500).optional(),
});
export type AdminReverseActionDto = z.infer<typeof AdminReverseActionSchema>;

export const AdminUpdateReportConfigSchema = z.object({
    quorumPct: z.number().int().min(1).max(100).optional(),
    floorCount: z.number().int().min(1).max(1000).optional(),
    minPresenceSec: z.number().int().min(0).max(86_400).optional(),
    banFirstHours: z.number().int().min(1).max(8_760).optional(),
    banSecondHours: z.number().int().min(1).max(8_760).optional(),
    bypassSeverityThreshold: z.number().int().min(1).max(5).optional(),
});
export type AdminUpdateReportConfigDto = z.infer<typeof AdminUpdateReportConfigSchema>;
