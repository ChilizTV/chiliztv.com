import type { Report, ReportTargetType } from '../entities/Report';

export interface IReportRepository {
    save(report: Report): Promise<Report>;

    /** Dedup check — mirrors the partial unique indexes (live vs global scope). */
    existsForReporter(
        reporterWallet: string,
        targetType: ReportTargetType,
        targetId: string,
        liveContextMatchId: number | null,
    ): Promise<boolean>;

    findOpenOnTarget(
        targetType: ReportTargetType,
        targetId: string,
        liveContextMatchId: number | null,
    ): Promise<Report[]>;

    /** Flips reports to auto_actioned and links them to the action. */
    markActionedBatch(reportIds: string[], actionId: string): Promise<void>;
}
