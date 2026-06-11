import type { ReportAction } from '../entities/ReportAction';
import type { ReportTargetType } from '../entities/Report';

export interface IReportActionRepository {
    /**
     * Inserts the action. On violation of the one-active-action-per-target
     * unique index (concurrent double trigger after a lock expiry),
     * implementations return the already-existing action instead of
     * throwing — callers treat that as "already done".
     */
    save(action: ReportAction): Promise<ReportAction>;

    findActiveForTarget(
        targetType: ReportTargetType,
        targetId: string,
        liveContextMatchId: number | null,
    ): Promise<ReportAction | null>;
}
