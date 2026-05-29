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
  season: number;
  status: string;
  matchDate: Date;
  venue?: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface IFootballApiService {
  fetchMatches(daysAhead: number): Promise<RawMatch[]>;
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
