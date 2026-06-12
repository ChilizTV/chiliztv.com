import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { Ban } from '@chiliztv/domain/reporting/entities/Ban';
import { BanAccountUseCase } from '../../reporting/use-cases/BanAccountUseCase';
import type { AuditContext } from '../AuditContext';

/**
 * Admin manual ban — same lifecycle as the quorum path (insert + Redis purge
 * + realtime notify + stream cascade via BanAccountUseCase), distinguished by
 * the admin_manual snapshot. Escalation still applies from prior history.
 */
@injectable()
export class CreateManualBanUseCase {
    constructor(
        private readonly banAccount: BanAccountUseCase,
        @inject(TOKENS.IAuditTrail) private readonly audit: IAuditTrail,
        @inject(TOKENS.IClock) private readonly clock: IClock,
    ) {}

    /** `durationHours`: hours, null = permanent, undefined = escalation policy. */
    async execute(
        ctx: AuditContext,
        walletAddress: string,
        reason: string,
        durationHours?: number | null,
    ): Promise<Ban> {
        const ban = await this.banAccount.execute({
            walletAddress,
            triggeredByReportId: null,
            triggeringLiveMatchId: null,
            durationHoursOverride: durationHours,
            quorumSnapshot: {
                trigger: 'admin_manual',
                issuedBy: ctx.actorWallet,
                reason,
                totalEligible: null,
                distinctReports: 0,
                quorumPct: 0,
                floorCount: 0,
                maxSeverity: 5,
                evaluatedAt: this.clock.now().toISOString(),
            },
        });
        await this.audit.record({
            ...ctx,
            action: 'moderation.ban.create',
            targetType: 'wallet',
            targetId: walletAddress.toLowerCase(),
            newValue: {
                banId: ban.props.id,
                reason,
                duration: durationHours === undefined ? 'auto' : durationHours === null ? 'permanent' : `${durationHours}h`,
                expiresAt: ban.props.expiresAt?.toISOString() ?? null,
            },
        });
        return ban;
    }
}
