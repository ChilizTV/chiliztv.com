import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { IFootballApiService, RawMatch, ExtendedOdds } from '@chiliztv/domain/shared/ports/IFootballApiService';
import { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import { Match, MatchOdds } from '@chiliztv/domain/matches/entities/Match';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { FIXED_LIST_KEYS, MatchCacheKeys } from '../MatchCacheKeys';

/**
 * API-Football still provides the implied odds line we display as a hint on
 * the UI before a market has any volume — the parimutuel contract itself
 * carries no odds, but a brand-new market with empty pools needs *some*
 * displayable initial probability for the bettor's UX. We persist these
 * cosmetic odds on the `matches.odds` JSONB column and never push them
 * on-chain (no more setMarketOdds in parimutuel).
 */

export interface SyncMatchesResult {
    matchesFetched: number;
    matchesStored: number;
    contractsDeployed: number;
}

/**
 * SyncMatchesUseCase
 * Orchestrates match synchronization:
 *  1. Fetch raw matches from IFootballApiService (domain port)
 *  2. Fetch odds via the same port
 *  3. Persist matches via IMatchRepository
 *  4. Deploy betting contracts via IBlockchainService (domain port)
 *  5. Sync odds to existing contracts
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

        const matchIds = rawMatches.map(m => m.apiFootballId);
        const oddsMap  = await this.footballApiService.fetchOddsForMatches(matchIds);

        let matchesStored    = 0;
        let contractsDeployed = 0;
        const changedMatchIds: number[] = [];
        const changedLeagueIds = new Set<number>();

        for (const raw of rawMatches) {
            try {
                const extendedOdds = oddsMap.get(raw.apiFootballId) ?? null;
                const matchOdds    = this.toMatchOdds(extendedOdds);

                const existing = await this.matchRepository.findByApiFootballId(raw.apiFootballId);

                if (existing) {
                    const mutated = await this.updateExistingMatch(existing, raw, matchOdds, extendedOdds);
                    matchesStored++;
                    if (mutated) {
                        changedMatchIds.push(raw.apiFootballId);
                        changedLeagueIds.add(raw.leagueId);
                    }
                } else {
                    const deployed = await this.createNewMatch(raw, matchOdds, extendedOdds);
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
        matchOdds: MatchOdds | undefined,
        extendedOdds: ExtendedOdds | null
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
        const oddsChanged = JSON.stringify(existingJson.odds ?? null) !== JSON.stringify(matchOdds ?? null);
        const mutated = scoreChanged || statusChanged || oddsChanged;

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
            odds:                   matchOdds,
            bettingContractAddress: existing.getBettingContractAddress(),
            createdAt:              existingJson.createdAt,
            updatedAt:              this.clock.now(),
        });

        await this.matchRepository.update(updated);
        // Note: in the parimutuel model the contract carries no odds — the
        // displayable hint is persisted via `matchOdds` above; nothing is
        // pushed on-chain (no more setMarketOdds).
        return mutated;
    }

    private async createNewMatch(
        raw: RawMatch,
        matchOdds: MatchOdds | undefined,
        _extendedOdds: ExtendedOdds | null
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
            odds:          matchOdds,
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

    /** Convert domain ExtendedOdds (1X2 only) to per-market MatchOdds. */
    private toMatchOdds(odds: ExtendedOdds | null): MatchOdds | undefined {
        if (!odds) return undefined;
        return {
            winner: { homeWin: odds.homeWin, draw: odds.draw, awayWin: odds.awayWin },
        };
    }
}
