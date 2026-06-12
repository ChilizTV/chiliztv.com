import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { IAdminDirectoryRepository } from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';

const LISTING_TTL_SECONDS = 60;
const MAX_MATCHES = 200;

/** Shared with the deploy/close use-cases so mutations refresh the listing. */
export const ADMIN_MATCHES_CACHE_KEY = 'admin:matches:summary';

/** Cache-safe read model — dates are ISO strings so the Redis round-trip is lossless. */
export interface AdminMatchSummary {
    readonly id: number;
    readonly homeTeamName: string;
    readonly homeTeamLogo: string | null;
    readonly awayTeamName: string;
    readonly awayTeamLogo: string | null;
    readonly leagueName: string;
    readonly status: string;
    readonly matchDate: string;
    /** In-game minute from the latest API snapshot — null pre-kickoff. */
    readonly elapsed: number | null;
    readonly score: { home: number; away: number } | null;
    readonly bettingContractAddress: string | null;
    readonly betCount: number;
    readonly totalStaked: string;
}

@injectable()
export class ListAdminMatchesUseCase {
    constructor(
        @inject(TOKENS.IMatchRepository) private readonly matches: IMatchRepository,
        @inject(TOKENS.IAdminDirectoryRepository) private readonly directory: IAdminDirectoryRepository,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
    ) {}

    async execute(): Promise<AdminMatchSummary[]> {
        const summaries = await this.cache.getOrLoad<AdminMatchSummary[]>({
            key: ADMIN_MATCHES_CACHE_KEY,
            ttlSeconds: LISTING_TTL_SECONDS,
            loader: () => this.load(),
        });
        return summaries ?? [];
    }

    private async load(): Promise<AdminMatchSummary[]> {
        const [all, volumes] = await Promise.all([
            this.matches.findAll(),
            this.directory.matchVolumes(),
        ]);

        return all
            .map((match) => match.toRaw())
            .sort((a, b) => b.matchDate.getTime() - a.matchDate.getTime())
            .slice(0, MAX_MATCHES)
            .map((raw) => {
                const contract = raw.bettingContractAddress?.toLowerCase() ?? null;
                const volume = contract ? volumes.get(contract) : undefined;
                return {
                    id: raw.id,
                    homeTeamName: raw.homeTeamName,
                    homeTeamLogo: raw.homeTeamLogo ?? null,
                    awayTeamName: raw.awayTeamName,
                    awayTeamLogo: raw.awayTeamLogo ?? null,
                    leagueName: raw.leagueName,
                    status: raw.status,
                    matchDate: raw.matchDate.toISOString(),
                    elapsed: raw.elapsed ?? null,
                    score: raw.homeScore !== undefined && raw.awayScore !== undefined
                        ? { home: raw.homeScore, away: raw.awayScore }
                        : null,
                    bettingContractAddress: contract,
                    betCount: volume?.betCount ?? 0,
                    totalStaked: volume?.totalStaked ?? '0',
                };
            });
    }
}
