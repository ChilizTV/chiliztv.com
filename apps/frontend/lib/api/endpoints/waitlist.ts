import { apiClient } from '../client';

/**
 * @notice Waitlist entry interface
 */
export interface WaitlistEntry {
  id: string;
  email: string;
  walletAddress?: string;
  source?: string;
  createdAt: string;
}

/**
 * @notice Waitlist statistics interface
 */
export interface WaitlistStats {
  totalEntries: number;
  totalWithWallet: number;
  totalWithoutWallet: number;
}

/**
 * @notice Join waitlist request DTO
 */
export interface JoinWaitlistDTO {
  email: string;
  walletAddress?: string;
  source?: string;
}

/**
 * @notice Waitlist API endpoints with type-safe methods
 * @dev All methods use the centralized API client with JWT auth
 */
export const waitlistApi = {
  /**
   * @notice Join the waitlist
   * @param data Waitlist entry data
   * @return Promise resolving to created entry
   */
  join: (data: JoinWaitlistDTO): Promise<{ success: boolean; entry: WaitlistEntry }> =>
    apiClient.post<{ success: boolean; entry: WaitlistEntry }>('/waitlist', data),

  /**
   * @notice Check if user has access
   * @param email User's email (optional)
   * @param walletAddress User's wallet address (optional)
   * @return Promise resolving to access check result
   */
  checkAccess: (email?: string, walletAddress?: string): Promise<{ success: boolean; hasAccess: boolean; email?: string; walletAddress?: string }> => {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (walletAddress) params.append('walletAddress', walletAddress);
    return apiClient.get<{ success: boolean; hasAccess: boolean; email?: string; walletAddress?: string }>(`/waitlist/check-access?${params.toString()}`);
  },

  /**
   * @notice Fetch waitlist statistics
   * @return Promise resolving to waitlist stats
   */
  getStats: (): Promise<{ success: boolean; stats: WaitlistStats }> =>
    apiClient.get<{ success: boolean; stats: WaitlistStats }>('/waitlist/stats'),
};
