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
  odds?: MatchOdds;
}

/**
 * Per-market odds shape returned by the backend (`MatchResponseDto.odds`).
 * Each top-level key matches a `bytes32` market hash on-chain. A missing
 * key means the admin hasn't posted odds for that market — front gates the bet.
 */
export interface MatchOdds {
  winner?: { homeWin: number; draw: number; awayWin: number };
  halftime?: { homeWin: number; draw: number; awayWin: number };
  goalsTotal?: { line: number; over: number; under: number };
  bothScore?: { yes: number; no: number };
  firstScorer?: { home: number; away: number; none: number };
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
