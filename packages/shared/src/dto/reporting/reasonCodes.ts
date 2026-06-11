import { z } from 'zod';

/**
 * Single source of truth for the report taxonomy. No SQL CHECK mirrors this
 * list on purpose — evolving it must not require a migration. Severity is
 * always computed server-side from this map, never client-provided.
 */
export const REPORT_REASON_CODES = [
    'spam', 'harassment', 'hate_speech', 'violence', 'sexual_content',
    'child_safety', 'illegal_content', 'scam', 'off_topic', 'other',
] as const;
export type ReportReasonCode = (typeof REPORT_REASON_CODES)[number];
export const ReportReasonCodeSchema = z.enum(REPORT_REASON_CODES);

export type ReportSeverity = 1 | 2 | 3 | 4 | 5;

export const REASON_SEVERITY: Record<ReportReasonCode, ReportSeverity> = {
    child_safety: 5,
    illegal_content: 4, violence: 4, sexual_content: 4,
    hate_speech: 3, scam: 3,
    harassment: 2, spam: 2,
    off_topic: 1, other: 1,
};

export const REPORT_TARGET_TYPES = ['stream', 'message', 'account'] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];
export const ReportTargetTypeSchema = z.enum(REPORT_TARGET_TYPES);
