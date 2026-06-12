import type { Report, ReportStatus, ReportTargetType } from '../entities/Report';

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

    /** Admin review queue — keyset on (severity DESC, created_at DESC, id DESC). */
    findForAdminQueue(filter: AdminReportFilter): Promise<AdminReportPage>;
    findById(id: string): Promise<Report | null>;
    /** Flips an OPEN report to dismissed/closed. Null when it wasn't open (409). */
    markReviewed(
        id: string,
        status: Extract<ReportStatus, 'dismissed' | 'closed'>,
        reviewerWallet: string,
        note: string | null,
        at: Date,
    ): Promise<Report | null>;
}

export interface AdminReportFilter {
    status?: ReportStatus;
    severityMin?: number;
    targetType?: ReportTargetType;
    cursor?: string | null;
    limit: number;
}

export interface AdminReportPage {
    reports: ReadonlyArray<Report>;
    nextCursor: string | null;
}
