/**
 * @notice Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * @notice Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * @notice Football match entity
 */
export interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  league: string;
  status: string;
  startTime: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  contractAddress?: string;
  odds?: {
    match_winner?: {
      home: number;
      draw: number;
      away: number;
    };
  };
}

/**
 * @notice User prediction/bet entity
 */
export interface Prediction {
  id: string;
  userId: string;
  walletAddress: string;
  username: string;
  matchId: number;
  matchName: string;
  predictionType: string;
  predictionValue: string;
  predictedTeam: string;
  odds: number;
  status: string;
  actualResult?: string;
  transactionHash: string;
  placedAt: string;
  matchStartTime: string;
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @notice User prediction statistics
 */
export interface PredictionStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  winRate: number;
  totalWagered: string;
  totalWon: string;
  netProfit: string;
}

/**
 * @notice Chat message entity
 */
export interface ChatMessage {
  id: string;
  matchId: number;
  userId: string;
  username: string;
  message: string;
  type: 'text' | 'bet' | 'system';
  createdAt: string;
}

/**
 * @notice Stream donation entity
 */
export interface Donation {
  id: string;
  streamerAddress: string;
  donorAddress: string;
  amount: string;
  platformFee: string;
  streamerAmount: string;
  message?: string;
  transactionHash: string;
  createdAt: string;
}

/**
 * @notice Stream subscription entity
 */
export interface Subscription {
  id: string;
  streamerAddress: string;
  subscriberAddress: string;
  amount: string;
  platformFee: string;
  streamerAmount: string;
  duration: number;
  expiresAt: string;
  isActive: boolean;
  transactionHash: string;
  createdAt: string;
}

/**
 * @notice Streamer earnings statistics
 */
export interface StreamWalletStats {
  totalDonations: string;
  totalSubscriptions: string;
  totalEarnings: string;
  donationCount: number;
  subscriptionCount: number;
  activeSubscribers: number;
}

/**
 * @notice Waitlist entry entity
 */
export interface WaitlistEntry {
  id: string;
  walletAddress: string;
  email?: string;
  hasAccess: boolean;
  createdAt: string;
  grantedAt?: string;
}

/**
 * @notice Waitlist statistics
 */
export interface WaitlistStats {
  total: number;
  granted: number;
  pending: number;
}
