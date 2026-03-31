/**
 * @notice Betting constants and market definitions
 * @dev Centralized betting configuration for contract interactions
 */

/**
 * @notice Market IDs matching contract definitions
 * @dev These IDs must match the on-chain contract market IDs
 */
export const MARKET_IDS = {
  MATCH_WINNER: 0,
  OVER_UNDER: 1,
  BOTH_TEAMS_SCORE: 2,
} as const;

/**
 * @notice Market outcome mappings
 */
export const MATCH_WINNER_OUTCOMES = {
  HOME: 0,
  DRAW: 1,
  AWAY: 2,
} as const;

export const OVER_UNDER_OUTCOMES = {
  OVER: 0,
  UNDER: 1,
} as const;

export const BTTS_OUTCOMES = {
  YES: 0,
  NO: 1,
} as const;

/**
 * @notice Betting limits in CHZ
 */
export const BETTING_LIMITS = {
  MIN_BET: 0.01,
} as const;

/**
 * @notice Market display names
 */
export const MARKET_NAMES: Record<number, string> = {
  [MARKET_IDS.MATCH_WINNER]: "Match Winner (1X2)",
  [MARKET_IDS.OVER_UNDER]: "Over/Under 2.5 Goals",
  [MARKET_IDS.BOTH_TEAMS_SCORE]: "Both Teams to Score",
};

/**
 * @notice Percentage shortcuts for betting UI
 */
export const BET_PERCENTAGES = [25, 50, 75, 100] as const;
