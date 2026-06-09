// RawMatch is the domain-level representation returned by IFootballApiService.
// Transformation from API-Football-specific types happens inside FootballApiAdapterImpl (infrastructure).
export interface RawMatch {
  apiFootballId: number;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string;
  leagueId: number;
  leagueName: string;
  leagueLogo: string;
  leagueCountry: string;
  /**
   * Round label from API-Football (e.g. "Final", "Group Stage",
   * "Round of 16 - 2nd Leg"). Consumed by KnockoutMatchPolicy to derive
   * `isKnockout` at match create. Optional because some lookups don't
   * expose it (admin manual seeds, test fixtures).
   */
  leagueRound?: string | null;
  /**
   * League type ('League' / 'Cup' / 'World') — NOT in /fixtures payloads
   * today, would require a /leagues lookup + cache. Optional so a future
   * source can populate it without breaking the contract.
   */
  leagueType?: string | null;
  season: number;
  status: string;
  matchDate: Date;
  venue?: string;
  homeScore: number | null;
  awayScore: number | null;
  /**
   * In-game minute as reported by API-Football. `null` outside the live
   * window (NS, HT pause, post-FT). Callers MUST preserve the previous
   * value in DB instead of overwriting with null during HT so the UI
   * displays a coherent minute counter across the break.
   */
  elapsed: number | null;
  /**
   * Score at halftime (45'). Null pre-HT; becomes a real value once the
   * match reaches HT and stays non-null through FT. Required to resolve
   * the HALFTIME market early (at HT, not at FT). Writers MUST preserve
   * the last known value — never overwrite with null during HT pause when
   * API-Football briefly clears the field.
   */
  htHomeScore: number | null;
  htAwayScore: number | null;
  /**
   * Aggregate score after extra time (90' + ET). Null for FT matches.
   * Used by display layer ("3 — 2 a.e.t.") and by the future
   * FULL_TIME_WINNER market resolution (knockout-only).
   */
  aetHomeScore: number | null;
  aetAwayScore: number | null;
  /**
   * Penalty shootout result. Null when the fixture didn't reach PEN.
   * The score reflects the shootout itself (e.g. 5-4), NOT an aggregate.
   * Used by display layer ("5 — 4 pen (1 — 1)") and to derive the
   * FULL_TIME_WINNER winner when the match went all the way to penalties.
   */
  penHomeScore: number | null;
  penAwayScore: number | null;
}

export interface IFootballApiService {
  /**
   * Window-bounded fetch (now-1d → now+daysAhead). Suitable for the
   * pre-match sync that runs every 10 min and needs to ingest new fixtures
   * + W/D/L form. NOT suitable for live score polling — see
   * {@link fetchLiveMatches}.
   */
  fetchMatches(daysAhead: number): Promise<RawMatch[]>;
  /**
   * Subset of currently in-play fixtures across all allowed leagues. Uses
   * `/fixtures?live=all` — one HTTP call regardless of how many matches are
   * concurrently live (Premier League weekend = ~10 fixtures, single req).
   * Quota-efficient enough to run every 30s. Returns `[]` (not stale) when
   * no live match is in the allowed leagues.
   */
  fetchLiveMatches(): Promise<RawMatch[]>;
  /**
   * Latest 5 W/D/L results for the team, all competitions combined.
   * Returns null when API-Football has no finished fixtures for this team.
   */
  getTeamForm(teamId: number): Promise<string | null>;
  /**
   * `true` when the adapter is currently serving cached/stale data because
   * the upstream is unreachable (circuit open) or the daily quota is
   * exhausted. Consumers should surface this on response DTOs so the UI can
   * render a "Stale data" badge instead of pretending the score is current.
   */
  isDataStale(): boolean;
}
