import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { IFootballApiService, RawMatch } from '@chiliztv/domain/shared/ports/IFootballApiService';
import { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { FIXED_LIST_KEYS, MatchCacheKeys } from '../MatchCacheKeys';
import { logger } from '../../../infrastructure/logging/logger';

// Cap fan-out of getTeamForm cache-misses to keep axios + the paid
// API-Football quota under control during WC peaks (200+ unique teams/sync).
const FORM_FETCH_CONCURRENCY = 10;

export interface SyncMatchesResult {
    matchesFetched: number;
    matchesStored: number;
    contractsDeployed: number;
}

/**
 * SyncMatchesUseCase
 * Orchestrates match synchronization:
 *  1. Fetch raw matches from IFootballApiService (domain port)
 *  2. Fetch each unique team's recent W/D/L form (via the same port)
 *  3. Persist matches via IMatchRepository
 *  4. Deploy betting contracts via IBlockchainService (domain port)
 *
 * No infrastructure imports — only domain ports and entities.
 */
@injectable()
export class SyncMatchesUseCase {
    constructor(
        @inject(TOKENS.IMatchRepository)
        private readonly matchRepository: IMatchRepository,
        @inject(TOKENS.IFootballApiService)
        private readonly footballApiService: IFootballApiService,
        @inject(TOKENS.IBlockchainService)
        private readonly blockchainService: IBlockchainService,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {}

    async execute(): Promise<SyncMatchesResult> {
        const rawMatches = await this.footballApiService.fetchMatches(MatchFetchWindow.FETCH_DAYS_AHEAD);

        if (rawMatches.length === 0) {
            return { matchesFetched: 0, matchesStored: 0, contractsDeployed: 0 };
        }

        const formByTeam = await this.fetchTeamForms(rawMatches);

        let matchesStored    = 0;
        let contractsDeployed = 0;
        const changedMatchIds: number[] = [];
        const changedLeagueIds = new Set<number>();

        for (const raw of rawMatches) {
            try {
                const homeForm = formByTeam.get(raw.homeTeamId) ?? null;
                const awayForm = formByTeam.get(raw.awayTeamId) ?? null;

                const existing = await this.matchRepository.findByApiFootballId(raw.apiFootballId);

                if (existing) {
                    const mutated = await this.updateExistingMatch(existing, raw, homeForm, awayForm);
                    matchesStored++;
                    if (mutated) {
                        changedMatchIds.push(raw.apiFootballId);
                        changedLeagueIds.add(raw.leagueId);
                    }
                } else {
                    const deployed = await this.createNewMatch(raw, homeForm, awayForm);
                    matchesStored++;
                    if (deployed) contractsDeployed++;
                    changedMatchIds.push(raw.apiFootballId);
                    changedLeagueIds.add(raw.leagueId);
                }
            } catch {
                // Individual match failures do not abort the full sync
            }
        }

        await this.invalidateCache(changedMatchIds, changedLeagueIds);

        return { matchesFetched: rawMatches.length, matchesStored, contractsDeployed };
    }

    /**
     * Dedup teams across the sync batch (Premier League weekend = 20 teams
     * across 10 matches → 20 unique calls instead of 20) and bound concurrency
     * so cache misses don't fan out > FORM_FETCH_CONCURRENCY axios reqs at
     * once. Cache hits return synchronously and are unaffected by the cap.
     */
    private async fetchTeamForms(rawMatches: ReadonlyArray<RawMatch>): Promise<Map<number, string | null>> {
        const uniqueIds = new Set<number>();
        for (const raw of rawMatches) {
            uniqueIds.add(raw.homeTeamId);
            uniqueIds.add(raw.awayTeamId);
        }
        const idList = Array.from(uniqueIds);
        const result = new Map<number, string | null>();

        // Manual chunking — p-limit is not a project dep.
        for (let i = 0; i < idList.length; i += FORM_FETCH_CONCURRENCY) {
            const chunk = idList.slice(i, i + FORM_FETCH_CONCURRENCY);
            await Promise.all(
                chunk.map(async (teamId) => {
                    try {
                        result.set(teamId, await this.footballApiService.getTeamForm(teamId));
                    } catch (err) {
                        logger.warn('getTeamForm failed', {
                            teamId,
                            error: err instanceof Error ? err.message : String(err),
                        });
                        result.set(teamId, null);
                    }
                }),
            );
        }
        return result;
    }

    /**
     * Drops every read-side cache key impacted by this sync run. Fixed list
     * keys are always purged when at least one match changed (the lists
     * themselves don't carry per-match granularity). Per-match and per-league
     * keys are purged selectively to avoid wiping unrelated buckets.
     *
     * Note: the freshness of in-game scores is bounded by the cadence of the
     * caller job (SyncMatchesJob, every 10 min by default) and the
     * API-Football indexing delay. This hook ensures the cache never *adds*
     * staleness on top of that floor; it does not reduce it. A sub-minute
     * score push would require a separate source (webhook or real-time feed).
     */
    private async invalidateCache(changedMatchIds: number[], changedLeagueIds: Set<number>): Promise<void> {
        if (changedMatchIds.length === 0) return;

        const deletions: Promise<unknown>[] = [];
        for (const key of FIXED_LIST_KEYS) deletions.push(this.cache.delete(key));
        for (const leagueId of changedLeagueIds) deletions.push(this.cache.delete(MatchCacheKeys.league(leagueId)));
        for (const matchId of changedMatchIds) deletions.push(this.cache.delete(MatchCacheKeys.single(matchId)));

        await Promise.allSettled(deletions);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private async updateExistingMatch(
        existing: Match,
        raw: RawMatch,
        homeForm: string | null,
        awayForm: string | null,
    ): Promise<boolean> {
        const existingJson = existing.toJSON();
        const existingScore = existingJson.score
            ? { home: existingJson.score.home, away: existingJson.score.away }
            : null;
        const rawScore = (raw.homeScore !== null && raw.awayScore !== null && raw.homeScore !== undefined && raw.awayScore !== undefined)
            ? { home: raw.homeScore, away: raw.awayScore }
            : null;
        const scoreChanged =
            existingScore?.home !== rawScore?.home ||
            existingScore?.away !== rawScore?.away;
        const statusChanged = existingJson.status !== raw.status;
        const formChanged = existingJson.homeForm !== homeForm || existingJson.awayForm !== awayForm;
        const mutated = scoreChanged || statusChanged || formChanged;

        const updated = Match.reconstitute({
            id:                     existingJson.id,
            apiFootballId:          raw.apiFootballId,
            homeTeamId:             raw.homeTeamId,
            homeTeamName:           raw.homeTeamName,
            homeTeamLogo:           raw.homeTeamLogo,
            awayTeamId:             raw.awayTeamId,
            awayTeamName:           raw.awayTeamName,
            awayTeamLogo:           raw.awayTeamLogo,
            leagueId:               raw.leagueId,
            leagueName:             raw.leagueName,
            leagueLogo:             raw.leagueLogo,
            leagueCountry:          raw.leagueCountry,
            season:                 raw.season,
            status:                 raw.status,
            matchDate:              raw.matchDate,
            venue:                  raw.venue,
            homeScore:              raw.homeScore ?? undefined,
            awayScore:              raw.awayScore ?? undefined,
            homeForm,
            awayForm,
            bettingContractAddress: existing.getBettingContractAddress(),
            createdAt:              existingJson.createdAt,
            updatedAt:              this.clock.now(),
        });

        await this.matchRepository.update(updated);
        return mutated;
    }

    private async createNewMatch(
        raw: RawMatch,
        homeForm: string | null,
        awayForm: string | null,
    ): Promise<boolean> {
        const newMatch = Match.create({
            id:            raw.apiFootballId,
            apiFootballId: raw.apiFootballId,
            homeTeamId:    raw.homeTeamId,
            homeTeamName:  raw.homeTeamName,
            homeTeamLogo:  raw.homeTeamLogo,
            awayTeamId:    raw.awayTeamId,
            awayTeamName:  raw.awayTeamName,
            awayTeamLogo:  raw.awayTeamLogo,
            leagueId:      raw.leagueId,
            leagueName:    raw.leagueName,
            leagueLogo:    raw.leagueLogo,
            leagueCountry: raw.leagueCountry,
            season:        raw.season,
            status:        raw.status,
            matchDate:     raw.matchDate,
            venue:         raw.venue,
            homeScore:     raw.homeScore ?? undefined,
            awayScore:     raw.awayScore ?? undefined,
            homeForm,
            awayForm,
        });

        const saved = await this.matchRepository.save(newMatch);

        try {
            const matchName     = `${raw.homeTeamName} vs ${raw.awayTeamName}`;
            const ownerAddress  = this.blockchainService.getAdminAddress();
            const { contractAddress } = await this.blockchainService.deployBettingContract(
                matchName,
                ownerAddress
            );

            // Seed the 3 default markets (WINNER + GOALS_TOTAL + BOTH_SCORE).
            // No odds are pushed on-chain — parimutuel derives them from pools.
            await this.blockchainService.setupDefaultMarkets(contractAddress);

            const matchWithContract = Match.reconstitute({
                ...saved.toJSON(),
                bettingContractAddress: contractAddress,
                updatedAt: this.clock.now(),
            });
            await this.matchRepository.update(matchWithContract);

            return true;
        } catch {
            return false;
        }
    }
}
