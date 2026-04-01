export interface ExtendedOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25?: number;
  under25?: number;
  bttsYes?: number;
  bttsNo?: number;
}

// RawMatch is the domain-level representation returned by IFootballApiService.
// Transformation from API-Football-specific types happens inside FootballApiAdapter (infrastructure).
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
  odds?: { homeWin: number; draw: number; awayWin: number };
  extendedOdds?: ExtendedOdds;
}

export interface IFootballApiService {
  fetchMatches(daysAhead: number): Promise<RawMatch[]>;
  fetchOddsForMatches(apiMatchIds: number[]): Promise<Map<number, ExtendedOdds>>;
}
