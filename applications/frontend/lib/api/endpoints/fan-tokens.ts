import { apiClient } from '../client';

/**
 * @notice Token balance interface
 */
export interface TokenBalance {
  token: {
    symbol: string;
    address: string;
    name: string;
  };
  balance: number;
}

/**
 * @notice User token balance response
 */
export interface UserTokenBalance {
  walletAddress: string;
  totalBalance: number;
  tokenBalances: TokenBalance[];
  isFeatured: boolean;
}

/**
 * @notice Fan tokens API endpoints with type-safe methods
 * @dev All methods use the centralized API client with JWT auth
 */
export const fanTokensApi = {
  /**
   * @notice Fetches fan token balances for a wallet address
   * @param walletAddress User's wallet address
   * @return Promise resolving to user token balance
   */
  getUserBalances: (walletAddress: string): Promise<{ success: boolean; balance: UserTokenBalance }> =>
    apiClient.get<{ success: boolean; balance: UserTokenBalance }>(`/fan-tokens/balances/${walletAddress}`),
};
