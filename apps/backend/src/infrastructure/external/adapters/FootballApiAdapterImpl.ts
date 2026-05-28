import { inject, injectable } from 'tsyringe';
import axios from 'axios';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IFootballApiService, RawMatch } from '@chiliztv/domain/shared/ports/IFootballApiService';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { ApiFootballMatch } from '../types/ApiFootball.types';
import { logger } from '../../logging/logger';

const FORM_CACHE_TTL_SECONDS = 3600;       // 1h — form moves max once per 3-7 days
const FORM_NEGATIVE_TTL_SECONDS = 600;     // 10 min — team has no completed fixtures
const FORM_JITTER_PCT = 15;
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

/**
 * FootballApiAdapterImpl
 * Implements IFootballApiService port.
 * Owns all API-Football-specific types and transformations.
 * No ApiFootball.* types cross this boundary.
 */
@injectable()
export class FootballApiAdapterImpl implements IFootballApiService {
    private readonly BASE_URL = 'https://v3.football.api-sports.io';
    private readonly API_KEY = process.env.API_FOOTBALL_KEY;
    private readonly ALLOWED_LEAGUE_IDS = [
        743, // Saudi Pro League
        15,  // FIFA World Cup
        39,  // Premier League
        61,  // Ligue 1
        140, // La Liga
        2,   // UEFA Champions League
        3,   // UEFA Europa League
        78,  // Bundesliga
        135  // Serie A
    ];

    private isFetching = false;

    constructor(
        @inject(TOKENS.IClock) private readonly clock: IClock,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
    ) {
        if (!this.API_KEY) {
            logger.warn('API_FOOTBALL_KEY not configured — FootballApiAdapterImpl will not function');
        }
    }

    // ─── IFootballApiService ──────────────────────────────────────────────────

    async fetchMatches(daysAhead: number = MatchFetchWindow.FETCH_DAYS_AHEAD): Promise<RawMatch[]> {
        if (this.isFetching) {
            logger.warn('Already fetching matches, skipping');
            return [];
        }
        if (!this.API_KEY) {
            logger.error('API_FOOTBALL_KEY not configured');
            return [];
        }

        this.isFetching = true;
        try {
            const now = this.clock.now();
            const from = this.formatDate(MatchFetchWindow.fetchFrom(now));
            const to   = this.formatDate(new Date(now.getTime() + daysAhead * 86_400_000));

            logger.info('Fetching matches from API-Football', { from, to, daysAhead });

            const response = await axios.get(`${this.BASE_URL}/fixtures`, {
                headers: this.headers(),
                params: { from, to, status: 'NS-LIVE-FT' },
            });

            const all: ApiFootballMatch[] = response.data.response ?? [];
            const filtered = all.filter(m => this.ALLOWED_LEAGUE_IDS.includes(m.league.id));

            logger.info('Matches fetched', { total: all.length, filtered: filtered.length });

            return filtered.map(m => this.toRawMatch(m));
        } catch (error) {
            logger.error('Error fetching matches', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return [];
        } finally {
            this.isFetching = false;
        }
    }

    /**
     * Latest 5 W/D/L results for the team across all competitions. Pulled from
     * `/fixtures?team={id}&last=5` and reversed so the returned string reads
     * oldest → newest (left = older, right = most recent). Cache-aside with
     * 1h TTL + 10 min negative TTL: form changes max every 3-7 days, so the
     * paid API call is amortised across many syncs.
     */
    async getTeamForm(teamId: number): Promise<string | null> {
        if (!this.API_KEY) return null;
        return this.cache.getOrLoad<string | null>({
            key: `apifootball:teamform:last5:${teamId}`,
            ttlSeconds: FORM_CACHE_TTL_SECONDS,
            negativeTtlSeconds: FORM_NEGATIVE_TTL_SECONDS,
            jitterPct: FORM_JITTER_PCT,
            loader: async () => {
                try {
                    const response = await axios.get(`${this.BASE_URL}/fixtures`, {
                        headers: this.headers(),
                        params: { team: teamId, last: 5 },
                        timeout: 10_000,
                    });
                    const fixtures: ApiFootballMatch[] = response.data?.response ?? [];
                    if (fixtures.length === 0) return null;
                    // API returns newest-first — reverse so the string reads
                    // oldest (left) → newest (right) when displayed.
                    const chars = fixtures
                        .slice()
                        .reverse()
                        .map((f) => this.deriveResult(f, teamId))
                        .filter((c) => c !== '');
                    return chars.length > 0 ? chars.join('') : null;
                } catch (err) {
                    logger.warn('getTeamForm fetch failed', {
                        teamId,
                        error: err instanceof Error ? err.message : String(err),
                    });
                    return null;
                }
            },
        });
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private headers(): Record<string, string> {
        return {
            'x-rapidapi-key': this.API_KEY!,
            'x-rapidapi-host': 'v3.football.api-sports.io',
        };
    }

    /** W/D/L from the team's perspective, empty string if the match isn't a finished result. */
    private deriveResult(fixture: ApiFootballMatch, teamId: number): 'W' | 'D' | 'L' | '' {
        const short = fixture.fixture?.status?.short;
        if (!short || !FINISHED_STATUSES.has(short)) return '';
        const { home, away } = fixture.goals ?? { home: null, away: null };
        if (home == null || away == null) return '';
        if (home === away) return 'D';
        const teamWasHome = fixture.teams?.home?.id === teamId;
        const teamWasAway = fixture.teams?.away?.id === teamId;
        if (!teamWasHome && !teamWasAway) return '';
        if (teamWasHome) return home > away ? 'W' : 'L';
        return away > home ? 'W' : 'L';
    }

    /**
     * Convert API-Football fixture to domain RawMatch.
     * This is the ONLY place ApiFootballMatch fields are accessed.
     */
    private toRawMatch(m: ApiFootballMatch): RawMatch {
        return {
            apiFootballId:  m.fixture.id,
            homeTeamId:     m.teams.home.id,
            homeTeamName:   m.teams.home.name,
            homeTeamLogo:   m.teams.home.logo ?? '',
            awayTeamId:     m.teams.away.id,
            awayTeamName:   m.teams.away.name,
            awayTeamLogo:   m.teams.away.logo ?? '',
            leagueId:       m.league.id,
            leagueName:     m.league.name,
            leagueLogo:     m.league.logo ?? '',
            leagueCountry:  m.league.country ?? '',
            season:         m.league.season,
            status:         this.mapApiStatus(m.fixture.status.short),
            matchDate:      new Date(m.fixture.date),
            venue:          m.fixture.venue?.name,
            homeScore:      m.goals.home,
            awayScore:      m.goals.away,
        };
    }

    private mapApiStatus(short: string): string {
        // Conserve le code brut API-Football. La classification (live / finished
        // / blocked / upcoming) est faite par `BettablePolicy.classifyStatus`
        // dans le domain — pas notre travail ici.
        if (!FootballApiAdapterImpl.KNOWN_STATUSES.has(short)) {
            console.warn('FootballApiAdapter: unknown API status, extend BettablePolicy mapping', { status: short });
        }
        return short;
    }

    private static readonly KNOWN_STATUSES: ReadonlySet<string> = new Set([
        'NS', 'TBD',
        '1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'SUSP', 'INT',
        'FT', 'AET', 'PEN', 'AWD', 'WO',
        'PST', 'CANC', 'ABD',
    ]);

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
