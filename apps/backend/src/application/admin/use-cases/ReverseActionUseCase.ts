import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IReportActionRepository } from '@chiliztv/domain/reporting/repositories/IReportActionRepository';
import type { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';
import type { ReportAction } from '@chiliztv/domain/reporting/entities/ReportAction';
import { ConflictError } from '@chiliztv/domain/shared/errors/ConflictError';
import { logger } from '../../../infrastructure/logging/logger';
import type { AuditContext } from '../AuditContext';

/**
 * Reverses a moderation action. soft_delete_message restores the message
 * (guarded on the action id); ban_account reversals go through LiftBan;
 * stop_stream has no compensation (the streamer just goes live again).
 */
@injectable()
export class ReverseActionUseCase {
    constructor(
        @inject(TOKENS.IReportActionRepository) private readonly actions: IReportActionRepository,
        @inject(TOKENS.IChatRepository) private readonly chat: IChatRepository,
        @inject(TOKENS.IClock) private readonly clock: IClock,
        @inject(TOKENS.IAuditTrail) private readonly audit: IAuditTrail,
    ) {}

    async execute(ctx: AuditContext, actionId: string, note: string | null): Promise<ReportAction> {
        const reversed = await this.actions.reverse(actionId, ctx.actorWallet, note, this.clock.now());
        if (!reversed) throw new ConflictError('Action already reversed');

        if (reversed.props.kind === 'soft_delete_message' && reversed.props.affectedMessageId) {
            const restored = await this.chat.restoreMessage(reversed.props.affectedMessageId, actionId);
            if (!restored) {
                logger.warn('Action reversed but message restore matched nothing', {
                    actionId,
                    messageId: reversed.props.affectedMessageId,
                });
            }
        }

        await this.audit.record({
            ...ctx,
            action: 'moderation.action.reverse',
            targetType: 'report_action',
            targetId: actionId,
            newValue: { kind: reversed.props.kind, note },
        });
        return reversed;
    }
}
