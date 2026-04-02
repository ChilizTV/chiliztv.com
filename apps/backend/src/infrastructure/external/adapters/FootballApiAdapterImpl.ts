import { injectable } from 'tsyringe';
import axios from 'axios';
import { IFootballApiService, RawMatch, ExtendedOdds } from '@chiliztv/domain/shared/ports/IFootballApiService';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import { ApiFootballMatch, ApiFootballOdds } from '../types/ApiFootball.types';
import { logger } from '../../logging/logger';

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

    constructor() {
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
            const now = new Date();
            const from = this.formatDate(MatchFetchWindow.fetchFrom(now));
            const to   = this.formatDate(new Date(now.getTime() + daysAhead * 86_400_000));

            logger.info('Fetching matches from API-Football', { from, to, daysAhead });

            const response = await axios.get(`${this.BASE_URL}/fixtures`, {
                headers: {
                    'x-rapidapi-key': this.API_KEY,
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                },
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

    async fetchOddsForMatches(apiMatchIds: number[]): Promise<Map<number, ExtendedOdds>> {
        const result = new Map<number, ExtendedOdds>();
        if (!this.API_KEY || apiMatchIds.length === 0) return result;

        try {
            logger.info('Fetching odds for matches', { count: apiMatchIds.length });

            const promises = apiMatchIds.map(async (id) => {
                try {
                    const response = await axios.get(`${this.BASE_URL}/odds`, {
                        headers: {
                            'x-rapidapi-key': this.API_KEY!,
                            'x-rapidapi-host': 'v3.football.api-sports.io',
                        },
                        params: { fixture: id, bookmaker: 1 },
                    });
                    const entries: ApiFootballOdds[] = response.data.response ?? [];
                    if (entries.length > 0) return { id, data: entries[0] };
                    return null;
                } catch {
                    return null;
                }
            });

            const settled = await Promise.all(promises);
            for (const entry of settled) {
                if (!entry) continue;
                const odds = this.parseOdds(entry.data);
                if (odds) result.set(entry.id, odds);
            }

            logger.info('Odds fetched', { requested: apiMatchIds.length, found: result.size });
        } catch (error) {
            logger.error('Error fetching odds', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }

        return result;
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

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

    /**
     * Parse API-Football bookmaker odds into domain ExtendedOdds.
     * All snake_case / nested API formats stop here.
     */
    private parseOdds(data: ApiFootballOdds): ExtendedOdds | null {
        if (!data.bookmakers || data.bookmakers.length === 0) return null;

        const bets = data.bookmakers[0].bets;
        let homeWin: number | undefined;
        let draw: number | undefined;
        let awayWin: number | undefined;
        let over25: number | undefined;
        let under25: number | undefined;
        let bttsYes: number | undefined;
        let bttsNo: number | undefined;

        // Match Winner (1X2)
        const mw = bets.find(b => b.name === 'Match Winner');
        if (mw) {
            homeWin = this.parseOdd(mw.values.find(v => v.value === 'Home')?.odd);
            draw    = this.parseOdd(mw.values.find(v => v.value === 'Draw')?.odd);
            awayWin = this.parseOdd(mw.values.find(v => v.value === 'Away')?.odd);
        }

        // Over/Under 2.5
        const ou = bets.find(b => b.name === 'Over/Under');
        if (ou) {
            over25  = this.parseOdd(ou.values.find(v => v.value === 'Over 2.5')?.odd);
            under25 = this.parseOdd(ou.values.find(v => v.value === 'Under 2.5')?.odd);
        }

        // Both Teams Score
        const btts = bets.find(b => b.name === 'Both Teams Score');
        if (btts) {
            bttsYes = this.parseOdd(btts.values.find(v => v.value === 'Yes')?.odd);
            bttsNo  = this.parseOdd(btts.values.find(v => v.value === 'No')?.odd);
        }

        // Require at minimum a complete 1X2 line
        if (homeWin == null || draw == null || awayWin == null) return null;

        return { homeWin, draw, awayWin, over25, under25, bttsYes, bttsNo };
    }

    private parseOdd(value?: string): number | undefined {
        if (value == null) return undefined;
        const n = parseFloat(value);
        return isNaN(n) ? undefined : n;
    }

    private mapApiStatus(short: string): string {
        const map: Record<string, string> = {
            NS: 'NS', LIVE: 'LIVE', '1H': 'LIVE', HT: 'LIVE',
            '2H': 'LIVE', ET: 'LIVE', P: 'LIVE',
            FT: 'FT', AET: 'FT', PEN: 'FT',
            PST: 'PST', CANC: 'CANC', ABD: 'ABD', AWD: 'AWD', WO: 'WO',
        };
        return map[short] ?? short;
    }

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
