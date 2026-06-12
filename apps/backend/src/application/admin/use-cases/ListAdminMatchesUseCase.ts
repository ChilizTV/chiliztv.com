import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { IAdminDirectoryRepository } from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';

const LISTING_TTL_SECONDS = 60;
const MAX_MATCHES = 200;

/** Cache-safe read model — dates are ISO strings so the Redis round-trip is lossless. */
export interface AdminMatchSummary {
    readonly id: number;
    readonly homeTeamName: string;
    readonly awayTeamName: string;
    readonly leagueName: string;
    readonly status: string;
    readonly matchDate: string;
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
            key: 'admin:matches:summary',
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
                    awayTeamName: raw.awayTeamName,
                    leagueName: raw.leagueName,
                    status: raw.status,
                    matchDate: raw.matchDate.toISOString(),
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
