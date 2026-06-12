import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { AdminReportFilter, AdminReportPage, IReportRepository } from '@chiliztv/domain/reporting/repositories/IReportRepository';

@injectable()
export class ListReportsUseCase {
    constructor(
        @inject(TOKENS.IReportRepository) private readonly reports: IReportRepository,
    ) {}

    async execute(filter: AdminReportFilter): Promise<AdminReportPage> {
        return this.reports.findForAdminQueue({ ...filter, limit: Math.min(Math.max(filter.limit, 1), 100) });
    }
}
