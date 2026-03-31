import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { Match } from '@/types/api.types';
import { useAuth } from '@/hooks/useAuth';

/**
 * @notice Hook to fetch all matches
 * @return Query result with matches data
 */
export function useMatches() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.matches.lists(),
    queryFn: matchesApi.getAll,
    enabled: isAuthenticated,
  });
}

/**
 * @notice Hook to fetch single match by ID
 * @param id Match ID
 * @return Query result with match data
 */
export function useMatch(id: number | string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.matches.detail(id),
    queryFn: () => matchesApi.getById(id),
    enabled: !!id && isAuthenticated,
  });
}

/**
 * @notice Hook to fetch live matches
 * @return Query result with live matches data
 */
export function useLiveMatches() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.matches.live(),
    queryFn: matchesApi.getLive,
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });
}

/**
 * @notice Hook to fetch upcoming matches
 * @return Query result with upcoming matches data
 */
export function useUpcomingMatches() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.matches.upcoming(),
    queryFn: matchesApi.getUpcoming,
    enabled: isAuthenticated,
  });
}

/**
 * @notice Hook to fetch matches by league
 * @param league League name
 * @return Query result with league matches data
 */
export function useMatchesByLeague(league: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.matches.byLeague(league),
    queryFn: () => matchesApi.getByLeague(league),
    enabled: !!league && isAuthenticated,
  });
}

/**
 * @notice Hook to fetch match statistics summary
 * @return Query result with match stats
 */
export function useMatchStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.matches.stats(),
    queryFn: matchesApi.getStats,
    enabled: isAuthenticated,
  });
}
