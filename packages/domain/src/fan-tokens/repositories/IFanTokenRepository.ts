export interface TokenBalance {
  token: {
    name: string;
    symbol: string;
    address: string;
  };
  balance: number;
}

export interface UserTokenBalance {
  walletAddress: string;
  totalBalance: number;
  tokenBalances: TokenBalance[];
  isFeatured: boolean;
}

export interface IFanTokenRepository {
  getUserBalances(walletAddress: string): Promise<UserTokenBalance>;
}
