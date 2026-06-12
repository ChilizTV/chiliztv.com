import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IReportRepository } from '@chiliztv/domain/reporting/repositories/IReportRepository';
import type { IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { Report } from '@chiliztv/domain/reporting/entities/Report';
import { ConflictError } from '@chiliztv/domain/shared/errors/ConflictError';
import type { AuditContext } from '../AuditContext';

/** Dismiss/close an open report — guarded UPDATE, 409 when no longer open. */
@injectable()
export class ReviewReportUseCase {
    constructor(
        @inject(TOKENS.IReportRepository) private readonly reports: IReportRepository,
        @inject(TOKENS.IAuditTrail) private readonly audit: IAuditTrail,
        @inject(TOKENS.IClock) private readonly clock: IClock,
    ) {}

    async execute(
        ctx: AuditContext,
        id: string,
        status: 'dismissed' | 'closed',
        note: string | null,
    ): Promise<Report> {
        const reviewed = await this.reports.markReviewed(id, status, ctx.actorWallet, note, this.clock.now());
        if (!reviewed) throw new ConflictError('Report is no longer open');
        await this.audit.record({
            ...ctx,
            action: `moderation.report.${status === 'dismissed' ? 'dismiss' : 'close'}`,
            targetType: 'report',
            targetId: id,
            newValue: { status, note },
        });
        return reviewed;
    }
}
