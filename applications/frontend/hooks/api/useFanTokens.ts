import { useQuery } from '@tanstack/react-query';
import { fanTokensApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

/**
 * @notice Hook to fetch user fan token balances
 * @param walletAddress User's wallet address
 * @return Query result with token balances
 */
export function useUserFanTokenBalances(walletAddress: string) {
  return useQuery({
    queryKey: queryKeys.fanTokens.balances(walletAddress),
    queryFn: () => fanTokensApi.getUserBalances(walletAddress),
    enabled: !!walletAddress,
  });
}
