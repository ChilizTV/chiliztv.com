import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IReportConfigProvider } from '@chiliztv/domain/reporting/ports/IReportConfigProvider';
import type { ReportConfig } from '@chiliztv/domain/reporting/value-objects/ReportConfig';
import type { IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';
import type { AuditContext } from '../AuditContext';

@injectable()
export class UpdateReportConfigUseCase {
    constructor(
        @inject(TOKENS.IReportConfigProvider) private readonly config: IReportConfigProvider,
        @inject(TOKENS.IAuditTrail) private readonly audit: IAuditTrail,
    ) {}

    async execute(ctx: AuditContext, patch: Partial<ReportConfig>): Promise<ReportConfig> {
        const before = await this.config.get();
        const after = await this.config.update(patch);
        await this.audit.record({
            ...ctx,
            action: 'config.report_config.update',
            targetType: 'report_config',
            targetId: '1',
            oldValue: before,
            newValue: after,
        });
        return after;
    }
}
