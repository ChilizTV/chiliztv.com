import { z } from 'zod';

import { ReportReasonCodeSchema, ReportTargetTypeSchema } from './reasonCodes';

/**
 * Client payload for POST /reports. Severity is intentionally absent — the
 * server derives it from the reason code taxonomy.
 */
export const createReportSchema = z.object({
    targetType: ReportTargetTypeSchema,
    targetId: z.string().min(1).max(128),
    reasonCode: ReportReasonCodeSchema,
    reasonFreeText: z.string().trim().max(500).optional(),
    liveContextMatchId: z.number().int().positive().optional(),
    liveContextStreamId: z.string().uuid().optional(),
});

export type CreateReportDto = z.infer<typeof createReportSchema>;

export interface ReportResponseDto {
    id: string;
    targetType: string;
    targetId: string;
    reasonCode: string;
    severity: number;
    status: string;
    /** ISO 8601 */
    createdAt: string;
}
