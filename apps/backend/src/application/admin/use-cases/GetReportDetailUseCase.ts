import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IReportRepository } from '@chiliztv/domain/reporting/repositories/IReportRepository';
import type { IReportActionRepository } from '@chiliztv/domain/reporting/repositories/IReportActionRepository';
import type { Report } from '@chiliztv/domain/reporting/entities/Report';
import type { ReportAction } from '@chiliztv/domain/reporting/entities/ReportAction';
import { NotFoundError } from '@chiliztv/domain/shared/errors/NotFoundError';

export interface ReportDetail {
    readonly report: Report;
    readonly triggeredAction: ReportAction | null;
}

@injectable()
export class GetReportDetailUseCase {
    constructor(
        @inject(TOKENS.IReportRepository) private readonly reports: IReportRepository,
        @inject(TOKENS.IReportActionRepository) private readonly actions: IReportActionRepository,
    ) {}

    async execute(id: string): Promise<ReportDetail> {
        const report = await this.reports.findById(id);
        if (!report) throw new NotFoundError('Report', id);
        const triggeredAction = report.props.triggeredActionId
            ? await this.actions.findById(report.props.triggeredActionId)
            : null;
        return { report, triggeredAction };
    }
}
