import { apiClient } from '../client';
import { Donation, Subscription, StreamerStats } from '@/models/stream-wallet.model';

/**
 * @notice Stream wallet API endpoints with type-safe methods
 * @dev All methods use the centralized API client with JWT auth
 */
export const streamWalletApi = {
  /**
   * @notice Fetches all donations for a streamer
   * @param streamerAddress Streamer's wallet address
   * @return Promise resolving to donations array
   */
  getStreamerDonations: (streamerAddress: string): Promise<{ success: boolean; donations: Donation[]; count: number }> =>
    apiClient.get<{ success: boolean; donations: Donation[]; count: number }>(`/stream-wallet/donations/${streamerAddress}`),

  /**
   * @notice Fetches all subscriptions for a streamer
   * @param streamerAddress Streamer's wallet address
   * @return Promise resolving to subscriptions array
   */
  getStreamerSubscriptions: (streamerAddress: string): Promise<{ success: boolean; subscriptions: Subscription[]; count: number }> =>
    apiClient.get<{ success: boolean; subscriptions: Subscription[]; count: number }>(`/stream-wallet/subscriptions/${streamerAddress}`),

  /**
   * @notice Fetches earnings statistics for a streamer
   * @param streamerAddress Streamer's wallet address
   * @return Promise resolving to streamer stats
   */
  getStreamerStats: (streamerAddress: string): Promise<{ success: boolean; stats: StreamerStats }> =>
    apiClient.get<{ success: boolean; stats: StreamerStats }>(`/stream-wallet/stats/${streamerAddress}`),

  /**
   * @notice Fetches donation history for a donor
   * @param donorAddress Donor's wallet address
   * @return Promise resolving to donations array
   */
  getDonorHistory: (donorAddress: string): Promise<{ success: boolean; donations: Donation[]; count: number }> =>
    apiClient.get<{ success: boolean; donations: Donation[]; count: number }>(`/stream-wallet/donor/${donorAddress}/donations`),

  /**
   * @notice Fetches subscription history for a subscriber
   * @param subscriberAddress Subscriber's wallet address
   * @return Promise resolving to subscriptions array
   */
  getSubscriberHistory: (subscriberAddress: string): Promise<{ success: boolean; subscriptions: Subscription[]; count: number }> =>
    apiClient.get<{ success: boolean; subscriptions: Subscription[]; count: number }>(`/stream-wallet/subscriber/${subscriberAddress}/subscriptions`),

  /**
   * @notice Self-onboards a streamer: deploys a `StreamWallet` proxy via
   * the platform admin signer (gas paid by the platform). Idempotent —
   * returns the existing proxy address with `created: false` if one is
   * already deployed for this address.
   */
  deployStreamerWallet: (streamerAddress: string): Promise<{ success: boolean; wallet: string; created: boolean }> =>
    apiClient.post<{ success: boolean; wallet: string; created: boolean }>(`/stream-wallet/deploy/${streamerAddress}`, {}),
};
