import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IBanRepository } from '@chiliztv/domain/reporting/repositories/IBanRepository';
import type { IModerationNotifier } from '@chiliztv/domain/reporting/ports/IModerationNotifier';
import type { IModerationAlerts } from '@chiliztv/domain/reporting/ports/IModerationAlerts';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';
import type { Ban } from '@chiliztv/domain/reporting/entities/Ban';
import { ConflictError } from '@chiliztv/domain/shared/errors/ConflictError';
import { banActiveKey } from '../../../shared/constants/moderation.constants';
import type { AuditContext } from '../AuditContext';

@injectable()
export class LiftBanUseCase {
    constructor(
        @inject(TOKENS.IBanRepository) private readonly bans: IBanRepository,
        @inject(TOKENS.IModerationNotifier) private readonly notifier: IModerationNotifier,
        @inject(TOKENS.IModerationAlerts) private readonly alerts: IModerationAlerts,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
        @inject(TOKENS.IClock) private readonly clock: IClock,
        @inject(TOKENS.IAuditTrail) private readonly audit: IAuditTrail,
    ) {}

    async execute(ctx: AuditContext, banId: string, note: string): Promise<Ban> {
        const lifted = await this.bans.liftByAdmin(banId, ctx.actorWallet, note, this.clock.now());
        if (!lifted) throw new ConflictError('Ban is not active');

        const wallet = lifted.props.walletAddress;
        await this.cache.delete(banActiveKey(wallet));
        await this.notifier.notifyBanLifted(wallet).catch(() => undefined);
        await this.alerts
            .banLifted({ wallet, source: 'admin', adminWallet: ctx.actorWallet, note })
            .catch(() => undefined);
        await this.audit.record({
            ...ctx,
            action: 'moderation.ban.lift',
            targetType: 'wallet',
            targetId: wallet,
            oldValue: { banId, status: 'active' },
            newValue: { status: 'lifted_by_admin', note },
        });
        return lifted;
    }
}
