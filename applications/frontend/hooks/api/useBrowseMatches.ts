import { useQuery } from '@tanstack/react-query';
import { browseApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import { useAuth } from '@/hooks/useAuth';

export function useBrowseMatches() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.browse.all,
    queryFn: browseApi.getMatches,
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
