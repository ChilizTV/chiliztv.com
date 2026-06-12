export type ReportSeverity = 1 | 2 | 3 | 4 | 5;

/**
 * Immutable record of why an automatic action fired — persisted as JSONB on
 * bans and report_actions for audit and future admin review.
 */
export interface QuorumSnapshot {
    trigger: 'quorum' | 'severity_bypass' | 'admin_manual';
    /** Set on admin_manual only. */
    issuedBy?: string;
    reason?: string;
    /** null when severity_bypass fired (no denominator was computed). */
    totalEligible: number | null;
    distinctReports: number;
    quorumPct: number;
    floorCount: number;
    maxSeverity: ReportSeverity;
    /** ISO 8601, from IClock. */
    evaluatedAt: string;
}
