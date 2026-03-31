import { useQuery } from '@tanstack/react-query';
import { streamWalletApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

/**
 * @notice Hook to fetch streamer's donations
 * @param streamerAddress Streamer's wallet address
 * @return Query result with donations
 */
export function useStreamerDonations(streamerAddress: string) {
  return useQuery({
    queryKey: queryKeys.streamWallet.donations(streamerAddress),
    queryFn: () => streamWalletApi.getStreamerDonations(streamerAddress),
    enabled: !!streamerAddress,
  });
}

/**
 * @notice Hook to fetch streamer's subscriptions
 * @param streamerAddress Streamer's wallet address
 * @return Query result with subscriptions
 */
export function useStreamerSubscriptions(streamerAddress: string) {
  return useQuery({
    queryKey: queryKeys.streamWallet.subscriptions(streamerAddress),
    queryFn: () => streamWalletApi.getStreamerSubscriptions(streamerAddress),
    enabled: !!streamerAddress,
  });
}

/**
 * @notice Hook to fetch streamer's earnings statistics
 * @param streamerAddress Streamer's wallet address
 * @return Query result with stats
 */
export function useStreamerStats(streamerAddress: string) {
  return useQuery({
    queryKey: queryKeys.streamWallet.stats(streamerAddress),
    queryFn: () => streamWalletApi.getStreamerStats(streamerAddress),
    enabled: !!streamerAddress,
  });
}

/**
 * @notice Hook to fetch donor's donation history
 * @param donorAddress Donor's wallet address
 * @return Query result with donation history
 */
export function useDonorHistory(donorAddress: string) {
  return useQuery({
    queryKey: queryKeys.streamWallet.donorDonations(donorAddress),
    queryFn: () => streamWalletApi.getDonorHistory(donorAddress),
    enabled: !!donorAddress,
  });
}

/**
 * @notice Hook to fetch subscriber's subscription history
 * @param subscriberAddress Subscriber's wallet address
 * @return Query result with subscription history
 */
export function useSubscriberHistory(subscriberAddress: string) {
  return useQuery({
    queryKey: queryKeys.streamWallet.subscriberSubscriptions(subscriberAddress),
    queryFn: () => streamWalletApi.getSubscriberHistory(subscriberAddress),
    enabled: !!subscriberAddress,
  });
}
