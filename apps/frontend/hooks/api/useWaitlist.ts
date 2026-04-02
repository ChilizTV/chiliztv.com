import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waitlistApi, JoinWaitlistDTO } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

/**
 * @notice Hook to check if user has access
 * @param email User's email (optional)
 * @param walletAddress User's wallet address (optional)
 * @return Query result with access status
 */
export function useCheckWaitlistAccess(email?: string, walletAddress?: string) {
  return useQuery({
    queryKey: queryKeys.waitlist.access(),
    queryFn: () => waitlistApi.checkAccess(email, walletAddress),
    enabled: !!(email || walletAddress),
  });
}

/**
 * @notice Hook to fetch waitlist statistics
 * @return Query result with waitlist stats
 */
export function useWaitlistStats() {
  return useQuery({
    queryKey: queryKeys.waitlist.stats(),
    queryFn: waitlistApi.getStats,
  });
}

/**
 * @notice Hook to join the waitlist
 * @return Mutation hook for joining waitlist
 * @dev Invalidates access and stats queries on success
 */
export function useJoinWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinWaitlistDTO) => waitlistApi.join(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlist.access(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.waitlist.stats(),
      });
    },
  });
}
