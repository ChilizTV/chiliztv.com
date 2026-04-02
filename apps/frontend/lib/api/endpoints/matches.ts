import { apiClient, normalizeFormatA } from '../client';
import { Match } from '@/types/api.types';
import type {
  MatchResponseDto,
  MatchStatsResponseDto,
} from '@chiliztv/shared/dto/matches/MatchResponseDto';

/**
 * Maps the nested MatchResponseDto (raw backend shape) to the flat Match type
 * consumed by frontend components. Consumers depend on Match, not MatchResponseDto.
 *
 * score?.home can be number | null at runtime (backend returns null when no score);
 * `?? undefined` normalises null → undefined to satisfy Match.homeScore?: number.
 */
function transformMatch(m: MatchResponseDto): Match {
  return {
    id: m.apiFootballId,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeTeamLogo: m.homeTeam.logo,
    awayTeamLogo: m.awayTeam.logo,
    league: m.league.name,
    status: m.status,
    startTime: m.matchDate,
    homeScore: m.score?.home ?? undefined,
    awayScore: m.score?.away ?? undefined,
    venue: m.venue,
    contractAddress: m.bettingContractAddress,
    odds: m.odds
      ? {
          match_winner: {
            home: m.odds.homeWin,
            draw: m.odds.draw,
            away: m.odds.awayWin,
          },
        }
      : undefined,
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
    const raw = await apiClient.get<unknown>('/matches');
    return normalizeFormatA<MatchResponseDto[]>(raw, 'matches').map(transformMatch);
  },

  /**
   * @notice Fetches single match by ID
   * @param id Match ID
   * @return Promise resolving to match data
   */
  getById: async (id: number | string): Promise<Match> => {
    const raw = await apiClient.get<unknown>(`/matches/${id}`);
    return transformMatch(normalizeFormatA<MatchResponseDto>(raw, 'match'));
  },

  /**
   * @notice Fetches live matches
   * @return Promise resolving to array of live matches
   */
  getLive: async (): Promise<Match[]> => {
    const raw = await apiClient.get<unknown>('/matches/live');
    return normalizeFormatA<MatchResponseDto[]>(raw, 'matches').map(transformMatch);
  },

  /**
   * @notice Fetches upcoming matches
   * @return Promise resolving to array of upcoming matches
   */
  getUpcoming: async (): Promise<Match[]> => {
    const raw = await apiClient.get<unknown>('/matches/upcoming');
    return normalizeFormatA<MatchResponseDto[]>(raw, 'matches').map(transformMatch);
  },

  /**
   * @notice Fetches matches by league
   * @param league League name
   * @return Promise resolving to array of matches in the league
   */
  getByLeague: async (league: string): Promise<Match[]> => {
    const raw = await apiClient.get<unknown>(`/matches/league/${league}`);
    return normalizeFormatA<MatchResponseDto[]>(raw, 'matches').map(transformMatch);
  },

  /**
   * @notice Fetches match statistics summary
   * @return Promise resolving to statistics data
   */
  getStats: async (): Promise<MatchStatsResponseDto> => {
    const raw = await apiClient.get<unknown>('/matches/stats/summary');
    return normalizeFormatA<MatchStatsResponseDto>(raw, 'stats');
  },
};
