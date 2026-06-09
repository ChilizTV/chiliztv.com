import { inject, injectable } from 'tsyringe';
import axios, { AxiosInstance } from 'axios';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IFootballApiService, RawMatch } from '@chiliztv/domain/shared/ports/IFootballApiService';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { ILockService } from '@chiliztv/domain/shared/ports/ILockService';
import { ApiFootballMatch } from '../types/ApiFootball.types';
import { logger } from '../../logging/logger';
import { env } from '../../config/environment';

const FORM_CACHE_TTL_SECONDS = 3600;       // 1h — form moves max once per 3-7 days
const FORM_NEGATIVE_TTL_SECONDS = 600;     // 10 min — team has no completed fixtures
const FORM_JITTER_PCT = 15;
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

const QUOTA_COUNTER_TTL_SECONDS = 36 * 3600; // 36h — survives daily reset, auto-expires
const QUOTA_WARN_PCT = 80;
const QUOTA_ERROR_PCT = 95;

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BACKOFFS_MS = [1000, 2000, 4000];
const RETRY_JITTER_PCT = 20;

const CIRCUIT_FAILURE_THRESHOLD = 5;
const CIRCUIT_OPEN_DURATION_MS = 5 * 60 * 1000;

const LAST_FETCH_CACHE_KEY = 'apifootball:lastfetch:matches';
const LAST_FETCH_CACHE_TTL_SECONDS = 6 * 3600;

const FETCH_LOCK_KEY = 'lock:apifootball:fetch';
const FETCH_LOCK_TTL_SECONDS = 90;

// Per-league fan-out throttle for `/fixtures` calls. API-Football enforces
// a per-minute (and burst) rate limit (300 req/min on Pro, 450 on Ultra).
// A 45-way naive `Promise.all` fires within ~100ms and exceeds any plan's
// burst budget — observed in prod with 100% of league calls returning
// `Too many requests`, matchesFetched=0, and the World Cup invisible on
// /browse. Target throughput: ~4 req/s sustained = 240/min, safely under
// Pro's 300/min cap while keeping a full sync below ~15s.
const PER_LEAGUE_FETCH_CONCURRENCY = 3;
const PER_LEAGUE_FETCH_GAP_MS = 250;

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
    // Allowlist sourced from `API_FOOTBALL_LEAGUE_IDS` (env). Common IDs:
    //   2 = UEFA Champions League · 3 = UEFA Europa League · 15 = FIFA World Cup
    //   39 = Premier League · 61 = Ligue 1 · 78 = Bundesliga · 135 = Serie A
    //   140 = La Liga · 743 = Saudi Pro League
    private readonly ALLOWED_LEAGUE_IDS: ReadonlyArray<number> = env.API_FOOTBALL_LEAGUE_IDS;

    private readonly client: AxiosInstance;
    /**
     * Set when API-Football returns `x-ratelimit-requests-remaining: 0`. Cleared
     * automatically when the UTC date rolls over (the quota window resets daily
     * at 00:00 UTC per api-sports.io billing).
     */
    private quotaExhausted = false;
    private quotaExhaustedAtUTCDate: string | null = null;
    /**
     * Consecutive non-quota failures. Quota-induced 429/403 must not count
     * toward the circuit (those have their own daily window).
     */
    private circuitFailures = 0;
    /** Wall-clock time after which the circuit half-opens (one trial allowed). */
    private circuitOpenUntil: Date | null = null;

    constructor(
        @inject(TOKENS.IClock) private readonly clock: IClock,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
        @inject(TOKENS.ILockService) private readonly lockService: ILockService,
    ) {
        if (!this.API_KEY) {
            logger.warn('API_FOOTBALL_KEY not configured — FootballApiAdapterImpl will not function');
        }

        this.client = axios.create({
            baseURL: this.BASE_URL,
            timeout: 10_000,
            headers: this.API_KEY
                ? {
                      'x-rapidapi-key': this.API_KEY,
                      'x-rapidapi-host': 'v3.football.api-sports.io',
                  }
                : {},
        });
        this.attachInterceptors();
    }

    /**
     * Request: increments the daily Redis counter so `/health/metrics` can
     * surface usage cross-instance. Response: reads the upstream rate-limit
     * headers and flips `quotaExhausted` when remaining hits zero — subsequent
     * public-method calls short-circuit before making a paid call.
     */
    private attachInterceptors(): void {
        this.client.interceptors.request.use(async (config) => {
            try {
                await this.cache.incr(
                    `metrics:apifootball:reqs:${this.todayUTCKey()}`,
                    QUOTA_COUNTER_TTL_SECONDS,
                );
            } catch (err) {
                // Quota tracking is observability, never block a real call on it.
                logger.warn('quota INCR failed', { error: err instanceof Error ? err.message : String(err) });
            }
            return config;
        });

        this.client.interceptors.response.use(
            (response) => {
                const remaining = Number(response.headers['x-ratelimit-requests-remaining'] ?? -1);
                const limit = Number(response.headers['x-ratelimit-requests-limit'] ?? -1);
                if (remaining >= 0 && limit > 0) {
                    const usedPct = ((limit - remaining) / limit) * 100;
                    if (remaining === 0) {
                        logger.error('API-Football quota exhausted — switching to cache-only until UTC midnight', { limit });
                        this.quotaExhausted = true;
                        this.quotaExhaustedAtUTCDate = this.todayUTCKey();
                    } else if (usedPct >= QUOTA_ERROR_PCT) {
                        logger.error('API-Football quota >95% used', { remaining, limit, usedPct });
                    } else if (usedPct >= QUOTA_WARN_PCT) {
                        logger.warn('API-Football quota >80% used', { remaining, limit, usedPct });
                    }
                }
                this.recordSuccess();
                return response;
            },
            async (error) => {
                const status: number | undefined = error?.response?.status;
                // Never retry on quota/auth — those need human intervention, not louder retries.
                const isQuotaOrAuth = status === 401 || status === 403 || status === 429;
                const isRetryable = !isQuotaOrAuth && (!status || (status >= 500 && status < 600));
                const config = error?.config ?? {};
                config.__retryCount = (config.__retryCount ?? 0) + 1;

                if (isRetryable && config.__retryCount <= MAX_RETRY_ATTEMPTS) {
                    const backoffBase = RETRY_BACKOFFS_MS[config.__retryCount - 1] ?? RETRY_BACKOFFS_MS[RETRY_BACKOFFS_MS.length - 1];
                    const jitter = Math.random() * (RETRY_JITTER_PCT / 100) * backoffBase;
                    const wait = backoffBase + jitter;
                    logger.warn('API-Football retry', {
                        attempt: config.__retryCount,
                        backoffMs: Math.round(wait),
                        status: status ?? 'network',
                    });
                    await new Promise((r) => setTimeout(r, wait));
                    return this.client.request(config);
                }

                // Exhausted retries or non-retryable → circuit accounting (skip quota/auth).
                if (!isQuotaOrAuth) {
                    this.recordFailure();
                }
                return Promise.reject(error);
            },
        );
    }

    private recordSuccess(): void {
        if (this.circuitFailures > 0 || this.circuitOpenUntil) {
            logger.info('API-Football circuit reset on success', { previousFailures: this.circuitFailures });
        }
        this.circuitFailures = 0;
        this.circuitOpenUntil = null;
    }

    private recordFailure(): void {
        this.circuitFailures += 1;
        if (this.circuitFailures >= CIRCUIT_FAILURE_THRESHOLD && !this.circuitOpenUntil) {
            this.circuitOpenUntil = new Date(this.clock.now().getTime() + CIRCUIT_OPEN_DURATION_MS);
            logger.error('API-Football circuit opened', {
                failures: this.circuitFailures,
                openUntil: this.circuitOpenUntil.toISOString(),
            });
        }
    }

    /**
     * `true` while the circuit is open. Auto half-opens after the cooldown so a
     * single trial call decides whether to re-close (success) or extend the
     * cooldown (next failure re-arms the timer in `recordFailure`).
     */
    private isCircuitOpen(): boolean {
        if (!this.circuitOpenUntil) return false;
        if (this.clock.now() >= this.circuitOpenUntil) {
            logger.info('API-Football circuit half-open (cooldown elapsed, trying again)');
            this.circuitOpenUntil = null;
            return false;
        }
        return true;
    }

    /**
     * Composed degraded-mode signal for the DTO `dataStale` flag (wired in 1.6).
     * Either condition means the next public-method call won't hit the upstream.
     */
    isDataStale(): boolean {
        return this.isCircuitOpen() || this.isQuotaBlocked();
    }

    private todayUTCKey(): string {
        const now = this.clock.now();
        const y = now.getUTCFullYear();
        const m = String(now.getUTCMonth() + 1).padStart(2, '0');
        const d = String(now.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    /**
     * Auto-reset the quota flag when the UTC day rolls over (api-sports.io
     * quota window is 24h aligned to UTC midnight). Callers must hit this
     * before issuing any paid request so the flag clears proactively.
     */
    private isQuotaBlocked(): boolean {
        if (!this.quotaExhausted) return false;
        const today = this.todayUTCKey();
        if (today !== this.quotaExhaustedAtUTCDate) {
            this.quotaExhausted = false;
            this.quotaExhaustedAtUTCDate = null;
            logger.info('API-Football quota window reset (new UTC day)');
            return false;
        }
        return true;
    }

    // ─── IFootballApiService ──────────────────────────────────────────────────

    async fetchMatches(daysAhead: number = MatchFetchWindow.FETCH_DAYS_AHEAD): Promise<RawMatch[]> {
        if (!this.API_KEY) {
            logger.error('API_FOOTBALL_KEY not configured');
            return [];
        }
        if (this.isQuotaBlocked()) {
            logger.warn('fetchMatches degraded — quota exhausted, serving last known snapshot');
            return this.readStaleFetchSnapshot();
        }
        if (this.isCircuitOpen()) {
            logger.warn('fetchMatches degraded — circuit open, serving last known snapshot');
            return this.readStaleFetchSnapshot();
        }

        // Distributed single-flight: only one instance fetches per window.
        // Contention → other instances skip and serve the last-good cache so
        // we never burn two slots of quota for the same tick across the fleet.
        const result = await this.lockService.withLock({
            key: FETCH_LOCK_KEY,
            ttlSeconds: FETCH_LOCK_TTL_SECONDS,
            onContention: 'skip',
            onAcquired: async () => this.fetchMatchesInner(daysAhead),
        });

        if (!result.ran) {
            logger.info('fetchMatches skipped — another worker holds the lock');
            return this.readStaleFetchSnapshot();
        }
        return result.result;
    }

    private async fetchMatchesInner(daysAhead: number): Promise<RawMatch[]> {
        try {
            const now = this.clock.now();
            const from = this.formatDate(MatchFetchWindow.fetchFrom(now));
            const to   = this.formatDate(new Date(now.getTime() + daysAhead * 86_400_000));

            logger.info('Fetching matches from API-Football', {
                from, to, daysAhead, leagues: this.ALLOWED_LEAGUE_IDS,
            });

            // API-Football: `from + to` queries REQUIRE `season` to be set or the
            // endpoint returns an empty `response` array (no error code).
            // Season convention differs per competition family — see `seasonForLeague`.
            // `/fixtures?from=&to=&season=` alone returns an empty array — the
            // endpoint requires `league` (or `team`) as a discriminator. We fire
            // one call per allow-listed league, THROTTLED (see mapThrottled docs
            // for the rate-limit rationale).
            const perLeague = await mapThrottled(
                this.ALLOWED_LEAGUE_IDS,
                (league) => {
                    const season = seasonForLeague(league, now);
                    return this.client
                        .get('/fixtures', { params: { from, to, season, league } })
                        .then((resp) => {
                            const errors = resp.data?.errors;
                            const hasErrors =
                                errors && typeof errors === 'object' && Object.keys(errors).length > 0;
                            if (hasErrors) {
                                logger.warn('API-Football returned errors', { league, season, errors });
                            }
                            return (resp.data?.response ?? []) as ApiFootballMatch[];
                        })
                        .catch((err) => {
                            logger.warn('API-Football per-league fetch failed', {
                                league,
                                season,
                                error: err instanceof Error ? err.message : String(err),
                            });
                            return [] as ApiFootballMatch[];
                        });
                },
                {
                    concurrency: PER_LEAGUE_FETCH_CONCURRENCY,
                    minDelayMsBetweenStarts: PER_LEAGUE_FETCH_GAP_MS,
                },
            );
            const all = perLeague.flat();

            logger.info('Matches fetched', { total: all.length, leagues: this.ALLOWED_LEAGUE_IDS.length });

            const raws = all.map(m => this.toRawMatch(m));
            // Persist last good snapshot so callers can serve it during circuit-open / quota-exhausted windows.
            void this.cache.set(LAST_FETCH_CACHE_KEY, raws, LAST_FETCH_CACHE_TTL_SECONDS).catch((err) =>
                logger.warn('lastFetch cache write failed', { error: err instanceof Error ? err.message : String(err) }),
            );
            return raws;
        } catch (error) {
            logger.error('Error fetching matches', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return this.readStaleFetchSnapshot();
        }
    }

    /**
     * In-play fixtures across allowed leagues. Uses `/fixtures?live=all` which
     * returns ALL currently live matches in one request — quota cost is one
     * call regardless of the number of concurrent live games. The league
     * allowlist is applied post-fetch because the upstream `league` param is
     * mutually exclusive with `live=all`.
     *
     * Intentionally cache-less: this is the freshness path. Quota and circuit
     * gates still apply via the shared interceptors + helpers below.
     */
    async fetchLiveMatches(): Promise<RawMatch[]> {
        if (!this.API_KEY) {
            logger.error('API_FOOTBALL_KEY not configured');
            return [];
        }
        if (this.isQuotaBlocked()) {
            logger.warn('fetchLiveMatches skipped — quota exhausted for this UTC day');
            return [];
        }
        if (this.isCircuitOpen()) {
            logger.warn('fetchLiveMatches skipped — circuit open');
            return [];
        }

        try {
            const response = await this.client.get('/fixtures', {
                params: { live: 'all' },
            });
            const all: ApiFootballMatch[] = response.data?.response ?? [];
            const filtered = all.filter(m => this.ALLOWED_LEAGUE_IDS.includes(m.league.id));
            logger.info('Live matches fetched', { total: all.length, filtered: filtered.length });
            return filtered.map(m => this.toRawMatch(m));
        } catch (error) {
            logger.error('Error fetching live matches', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return [];
        }
    }

    /**
     * Last successful `fetchMatches` payload — used when the live API is
     * unreachable (circuit open, quota exhausted, or transient error after
     * retries). Empty array on cache miss; callers handle empty gracefully.
     */
    private async readStaleFetchSnapshot(): Promise<RawMatch[]> {
        try {
            const hit = await this.cache.get<RawMatch[]>(LAST_FETCH_CACHE_KEY);
            return hit.hit ? hit.value : [];
        } catch (err) {
            logger.warn('lastFetch cache read failed', { error: err instanceof Error ? err.message : String(err) });
            return [];
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
                if (this.isQuotaBlocked()) {
                    logger.warn('getTeamForm skipped — quota exhausted', { teamId });
                    return null;
                }
                try {
                    const response = await this.client.get('/fixtures', {
                        params: { team: teamId, last: 5 },
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
            leagueRound:    m.league.round ?? null,
            leagueType:     m.league.type ?? null,
            season:         m.league.season,
            status:         this.mapApiStatus(m.fixture.status.short),
            matchDate:      new Date(m.fixture.date),
            venue:          m.fixture.venue?.name,
            homeScore:      m.goals.home,
            awayScore:      m.goals.away,
            elapsed:        m.fixture.status.elapsed ?? null,
            htHomeScore:    m.score?.halftime?.home ?? null,
            htAwayScore:    m.score?.halftime?.away ?? null,
            aetHomeScore:   m.score?.extratime?.home ?? null,
            aetAwayScore:   m.score?.extratime?.away ?? null,
            penHomeScore:   m.score?.penalty?.home ?? null,
            penAwayScore:   m.score?.penalty?.away ?? null,
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

/** API-Football season number for European leagues (Aug → May/Jun). */
function currentEuropeanSeason(now: Date): number {
    const year = now.getUTCFullYear();
    return now.getUTCMonth() >= 7 ? year : year - 1;
}

/**
 * Hardcoded allowlist of API-Football league IDs whose `season` parameter is
 * the **calendar year** of the event rather than the European Aug-May span.
 *
 * National-team tournaments (WC, Euro, Copa America, AFCON) and the bulk of
 * their qualification competitions are numbered by the year of the final
 * tournament (e.g. `season=2026` for the 2026 World Cup, not `2025`).
 * Using the European-season fallback for these returns an empty fixtures
 * array — silently, no error — and the competition vanishes from `/browse`.
 *
 * INTENTIONALLY hardcoded (not env-driven) — these IDs are stable
 * domain knowledge tied to API-Football's league numbering. Adding a new
 * tournament here requires a sanity check via
 *   `GET /fixtures?league=<id>&season=<calendarYear>&from=...&to=...`
 * to confirm the season convention before merging.
 */
const CALENDAR_YEAR_SEASON_LEAGUE_IDS: ReadonlySet<number> = new Set<number>([
    1,   // FIFA World Cup
    29,  // WC Qualification — Africa
    30,  // WC Qualification — Asia
    31,  // WC Qualification — CONCACAF
    32,  // WC Qualification — Europe
    33,  // WC Qualification — Oceania
    34,  // WC Qualification — South America
    4,   // UEFA European Championship (Euro)
    9,   // Copa America
    6,   // Africa Cup of Nations (AFCON)
]);

/**
 * Resolves the `season` query param API-Football expects for a given league.
 * Calendar-year tournaments (WC, Euro, Copa America, AFCON + qualifiers)
 * use the current UTC year; everything else uses the European convention
 * (Aug N → Jun N+1 ⇒ season = N).
 */
function seasonForLeague(leagueId: number, now: Date): number {
    if (CALENDAR_YEAR_SEASON_LEAGUE_IDS.has(leagueId)) {
        return now.getUTCFullYear();
    }
    return currentEuropeanSeason(now);
}

/**
 * Throttled equivalent of `Promise.all(items.map(fn))`.
 *
 * Caps the number of in-flight promises at `concurrency` AND enforces a
 * minimum spacing of `minDelayMsBetweenStarts` between request *starts*.
 * Required for the per-league `/fixtures` fan-out: a naive parallel burst
 * blows through API-Football's rate limit (300 req/min on Pro) and every
 * call comes back `Too many requests`.
 *
 * Result order matches `items`. Throws if `fn` throws (caller wraps in
 * try/catch in the existing adapter — we don't swallow here).
 *
 * Slot reservation is deterministic — each item claims `nextStartAt`, then
 * bumps it by `minDelayMsBetweenStarts`. Workers race for the next slot via
 * `nextIndex++` (atomic in single-threaded JS). The sleep that follows is
 * relative to the reserved slot, not to "now", so even if a previous call
 * was slow, the next one still starts on its scheduled tick.
 */
async function mapThrottled<TIn, TOut>(
    items: ReadonlyArray<TIn>,
    fn: (item: TIn) => Promise<TOut>,
    opts: { concurrency: number; minDelayMsBetweenStarts: number },
): Promise<TOut[]> {
    const results: TOut[] = new Array(items.length);
    let nextIndex = 0;
    let nextStartAt = Date.now();

    const worker = async (): Promise<void> => {
        while (true) {
            const i = nextIndex++;
            if (i >= items.length) return;

            const slotStartAt = nextStartAt;
            nextStartAt = slotStartAt + opts.minDelayMsBetweenStarts;

            const waitMs = slotStartAt - Date.now();
            if (waitMs > 0) {
                await new Promise<void>((r) => setTimeout(r, waitMs));
            }

            results[i] = await fn(items[i]);
        }
    };

    const workerCount = Math.min(opts.concurrency, items.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
}
