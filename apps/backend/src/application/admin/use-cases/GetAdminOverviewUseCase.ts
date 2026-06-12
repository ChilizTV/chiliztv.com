import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { IReportRepository } from '@chiliztv/domain/reporting/repositories/IReportRepository';
import type { IBanRepository } from '@chiliztv/domain/reporting/repositories/IBanRepository';
import type { IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import type { IAuditLogReader } from '@chiliztv/domain/admin/ports/IAuditLogReader';
import type { AdminRole } from '@chiliztv/domain/admin/types';
import { isAllowed } from '@chiliztv/domain/admin/policies/AdminRolePolicy';

import { ListAdminMatchesUseCase, type AdminMatchSummary } from './ListAdminMatchesUseCase';

const OVERVIEW_TTL_SECONDS = 30;
const ACTIVITY_LIMIT = 8;
const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'SUSP', 'INT']);
const UPCOMING_STATUSES = new Set(['NS', 'TBD']);

export interface OverviewActivity {
    readonly action: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly actorWallet: string;
    readonly at: string;
}

/** Cache-safe (ISO dates); the full payload is cached once, then stripped per role. */
export interface AdminOverview {
    readonly openReports: { total: number; highSeverity: number } | null;
    readonly activeBans: { total: number; permanent: number } | null;
    readonly liveCount: number;
    readonly liveNow: AdminMatchSummary[];
    readonly volume24h: string;
    readonly nextKickoffAt: string | null;
    readonly recentActivity: OverviewActivity[] | null;
}

@injectable()
export class GetAdminOverviewUseCase {
    constructor(
        @inject(TOKENS.IReportRepository) private readonly reports: IReportRepository,
        @inject(TOKENS.IBanRepository) private readonly bans: IBanRepository,
        @inject(TOKENS.IBetRepository) private readonly bets: IBetRepository,
        @inject(TOKENS.IAuditLogReader) private readonly auditLog: IAuditLogReader,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
        @inject(TOKENS.IClock) private readonly clock: IClock,
        private readonly listMatches: ListAdminMatchesUseCase,
    ) {}

    async execute(role: AdminRole): Promise<AdminOverview> {
        const full = await this.cache.getOrLoad<AdminOverview>({
            key: 'admin:overview',
            ttlSeconds: OVERVIEW_TTL_SECONDS,
            loader: () => this.load(),
        });
        const overview = full ?? this.emptyOverview();

        // PO matrix: moderation counters are moderator-scope, the audit feed
        // is admin-scope; live matches and volume are non-sensitive context.
        const canModeration = isAllowed(role, ['moderator']);
        const canAudit = isAllowed(role, ['admin']);
        return {
            ...overview,
            openReports: canModeration ? overview.openReports : null,
            activeBans: canModeration ? overview.activeBans : null,
            recentActivity: canAudit ? overview.recentActivity : null,
        };
    }

    private async load(): Promise<AdminOverview> {
        const now = this.clock.now();
        const since24h = new Date(now.getTime() - 24 * 3_600_000);
        const [openReports, activeBans, matches, staked, activity] = await Promise.all([
            this.reports.countOpen(),
            this.bans.countActive(now),
            this.listMatches.execute(),
            this.bets.sumStakeAmountSince(since24h),
            this.auditLog.findRecent(ACTIVITY_LIMIT),
        ]);

        const liveNow = matches.filter((m) => LIVE_STATUSES.has(m.status));
        const nextKickoff = matches
            .filter((m) => UPCOMING_STATUSES.has(m.status) && new Date(m.matchDate) > now)
            .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())[0];

        return {
            openReports,
            activeBans,
            liveCount: liveNow.length,
            liveNow,
            volume24h: staked.toString(),
            nextKickoffAt: nextKickoff?.matchDate ?? null,
            recentActivity: activity.map((entry) => ({
                action: entry.action,
                targetType: entry.targetType,
                targetId: entry.targetId,
                actorWallet: entry.actorWallet,
                at: entry.createdAt.toISOString(),
            })),
        };
    }

    private emptyOverview(): AdminOverview {
        return {
            openReports: { total: 0, highSeverity: 0 },
            activeBans: { total: 0, permanent: 0 },
            liveCount: 0,
            liveNow: [],
            volume24h: '0',
            nextKickoffAt: null,
            recentActivity: [],
        };
    }
}
