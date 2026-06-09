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
  /** Latest W/D/L results per side (oldest → newest, up to 5 chars). Null when no API data. */
  homeForm: string | null;
  awayForm: string | null;
  /**
   * In-game minute as last persisted by the backend. Authoritative source —
   * use this rather than recalculating from kickoff client-side. Null
   * before kickoff (NS) or when no API-Football data has arrived yet.
   */
  elapsed: number | null;
  /**
   * Halftime score (45'). Monotone — once captured by the backend it
   * survives the HT pause where the upstream briefly clears the field.
   * Null pre-HT. Used to gate the HALFTIME early-resolution + the
   * `<HalftimeDelayBadge />` on the row.
   */
  htHomeScore: number | null;
  htAwayScore: number | null;
  /**
   * Aggregate score after extra time (90' + ET). NULL for FT matches that
   * never reached AET. Optional in the wire shape — tolerates cached payloads
   * emitted before the AET/PEN rollout.
   */
  aetHomeScore?: number | null;
  aetAwayScore?: number | null;
  /**
   * Penalty shootout result (e.g. 5-4). NULL when the match didn't reach a
   * shootout. Reflects the shootout itself, NOT an aggregate.
   */
  penHomeScore?: number | null;
  penAwayScore?: number | null;
  /** `true` when the fixture is knockout (cup or league knockout phase). */
  isKnockout?: boolean;
  /**
   * Backend signal that API-Football is in degraded mode (circuit open or
   * daily quota exhausted). When true, the score may be stale — UI renders a
   * "Stale data" badge so the user doesn't trust the displayed value blindly.
   */
  dataStale?: boolean;
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
