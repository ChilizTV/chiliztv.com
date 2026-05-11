import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accessApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

export function useAccessStatus() {
  return useQuery({
    queryKey: queryKeys.access.granted(),
    queryFn: () => accessApi.me(),
    staleTime: 60_000,
  });
}

export function useRedeemAccessCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => accessApi.redeem(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.access.all });
    },
  });
}
