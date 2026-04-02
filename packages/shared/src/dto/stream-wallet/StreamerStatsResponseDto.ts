export interface StreamerStatsResponseDto {
  streamerAddress?: string;
  /** Number of donations received (integer count) */
  totalDonations: number;
  /** Total donation amount in wei, serialized from bigint. Parse with BigInt(dto.totalDonationAmount) for calculations. */
  totalDonationAmount: string;
  /**
   * Total revenue amount (= totalDonationAmount).
   * Alias exposed by the backend: stats.totalRevenue = stats.totalDonationAmount
   */
  totalRevenue: string;
  totalSubscribers: number;
  activeSubscribers: number;
}
