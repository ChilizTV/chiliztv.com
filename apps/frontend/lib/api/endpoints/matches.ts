import { apiClient } from '../client';
import { Match } from '@/types/api.types';

interface BackendMatch {
  id: string;
  apiFootballId: number;
  homeTeam: { id: number; name: string; logo?: string };
  awayTeam: { id: number; name: string; logo?: string };
  league: { id: number; name: string };
  season: string;
  status: string;
  matchDate: string;
  venue?: string;
  score: { home?: number; away?: number } | null;
  odds?: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  bettingContractAddress?: string;
  createdAt: string;
  updatedAt: string;
}

interface MatchesResponse {
  success: boolean;
  matches: BackendMatch[];
  count: number;
  timestamp: number;
}

interface MatchResponse {
  success: boolean;
  match: BackendMatch;
}

interface StatsResponse {
  success: boolean;
  stats: {
    total: number;
    live: number;
    upcoming: number;
    finished: number;
  };
}

/**
 * @notice Transform backend match to frontend Match type
 */
function transformMatch(backendMatch: BackendMatch): Match {
  return {
    id: backendMatch.apiFootballId,
    homeTeam: backendMatch.homeTeam.name,
    awayTeam: backendMatch.awayTeam.name,
    homeTeamLogo: backendMatch.homeTeam.logo,
    awayTeamLogo: backendMatch.awayTeam.logo,
    league: backendMatch.league.name,
    status: backendMatch.status,
    startTime: backendMatch.matchDate,
    homeScore: backendMatch.score?.home,
    awayScore: backendMatch.score?.away,
    venue: backendMatch.venue,
    contractAddress: backendMatch.bettingContractAddress,
    odds: backendMatch.odds ? {
      match_winner: {
        home: backendMatch.odds.homeWin,
        draw: backendMatch.odds.draw,
        away: backendMatch.odds.awayWin,
      }
    } : undefined,
  };
}

/**
 * @notice Match API endpoints with type-safe methods
 * @dev All methods use the centralized API client with JWT auth
 */
export const matchesApi = {
  /**
   * @notice Fetches all matches
   * @return Promise resolving to array of matches
   */
  getAll: async (): Promise<Match[]> => {
    const response = await apiClient.get<MatchesResponse>('/matches');
    return response.matches.map(transformMatch);
  },

  /**
   * @notice Fetches single match by ID
   * @param id Match ID
   * @return Promise resolving to match data
   */
  getById: async (id: number | string): Promise<Match> => {
    const response = await apiClient.get<MatchResponse>(`/matches/${id}`);
    return transformMatch(response.match);
  },

  /**
   * @notice Fetches live matches
   * @return Promise resolving to array of live matches
   */
  getLive: async (): Promise<Match[]> => {
    const response = await apiClient.get<MatchesResponse>('/matches/live');
    return response.matches.map(transformMatch);
  },

  /**
   * @notice Fetches upcoming matches
   * @return Promise resolving to array of upcoming matches
   */
  getUpcoming: async (): Promise<Match[]> => {
    const response = await apiClient.get<MatchesResponse>('/matches/upcoming');
    return response.matches.map(transformMatch);
  },

  /**
   * @notice Fetches matches by league
   * @param league League name
   * @return Promise resolving to array of matches in the league
   */
  getByLeague: async (league: string): Promise<Match[]> => {
    const response = await apiClient.get<MatchesResponse>(`/matches/league/${league}`);
    return response.matches.map(transformMatch);
  },

  /**
   * @notice Fetches match statistics summary
   * @return Promise resolving to statistics data
   */
  getStats: async (): Promise<{ total: number; live: number; upcoming: number; finished: number }> => {
    const response = await apiClient.get<StatsResponse>('/matches/stats/summary');
    return response.stats;
  },
};
