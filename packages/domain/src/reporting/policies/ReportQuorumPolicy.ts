import type { QuorumSnapshot, ReportSeverity } from '../value-objects/QuorumSnapshot';
import type { ReportConfig } from '../value-objects/ReportConfig';

export interface QuorumInput {
    distinctReports: number;
    /** Eligible wallets in the live context (streamer + banned excluded). */
    totalEligible: number;
    maxSeverity: ReportSeverity;
    config: Pick<ReportConfig, 'quorumPct' | 'floorCount' | 'bypassSeverityThreshold'>;
    now: Date;
}

export type QuorumDecision =
    | { readonly triggered: true; readonly snapshot: QuorumSnapshot }
    | { readonly triggered: false; readonly reason: 'below_threshold' };

/**
 * Threshold = MAX(floor, ceil(totalEligible × quorumPct%)). Severity at or
 * above the bypass threshold (DSA fast-path) fires immediately with no
 * denominator.
 */
export function evaluateQuorum(input: QuorumInput): QuorumDecision {
    const { distinctReports, totalEligible, maxSeverity, config, now } = input;

    if (maxSeverity >= config.bypassSeverityThreshold) {
        return {
            triggered: true,
            snapshot: {
                trigger: 'severity_bypass',
                totalEligible: null,
                distinctReports,
                quorumPct: config.quorumPct,
                floorCount: config.floorCount,
                maxSeverity,
                evaluatedAt: now.toISOString(),
            },
        };
    }

    const ratioThreshold = Math.ceil((totalEligible * config.quorumPct) / 100);
    const threshold = Math.max(config.floorCount, ratioThreshold);

    if (distinctReports < threshold) {
        return { triggered: false, reason: 'below_threshold' };
    }

    return {
        triggered: true,
        snapshot: {
            trigger: 'quorum',
            totalEligible,
            distinctReports,
            quorumPct: config.quorumPct,
            floorCount: config.floorCount,
            maxSeverity,
            evaluatedAt: now.toISOString(),
        },
    };
}
