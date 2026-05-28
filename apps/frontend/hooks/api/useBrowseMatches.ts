import { useQuery } from '@tanstack/react-query';
import { browseApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

// Public read
export function useBrowseMatches() {
  return useQuery({
    queryKey: queryKeys.browse.all,
    queryFn: browseApi.getMatches,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}