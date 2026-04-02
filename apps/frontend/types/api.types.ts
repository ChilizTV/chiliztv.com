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
 * @notice Football match entity (flat UI type used by components)
 * @see MatchResponseDto in @chiliztv/shared for the API response shape
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
 * @notice User prediction/bet entity (flat UI type used by components)
 * @see PredictionResponseDto in @chiliztv/shared for the API response shape
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
