import { FAN_TOKENS, FanTokenData } from "@/utils/FanTokens";
import {
  MARKET_IDS as MARKET_IDS_CONST,
  MATCH_WINNER_OUTCOMES,
  OVER_UNDER_OUTCOMES,
  BTTS_OUTCOMES,
  BET_PERCENTAGES,
  BETTING_LIMITS,
  MARKET_NAMES,
} from "@/lib/utils/constants/betting";

/**
 * @notice Market IDs for betting contract (BigInt versions)
 * @dev Converts number constants to BigInt for contract interactions
 */
export const MARKET_IDS = {
  MATCH_WINNER: BigInt(MARKET_IDS_CONST.MATCH_WINNER),
  OVER_UNDER: BigInt(MARKET_IDS_CONST.OVER_UNDER),
  BOTH_TEAMS_SCORE: BigInt(MARKET_IDS_CONST.BOTH_TEAMS_SCORE),
} as const;

/**
 * @notice Outcome indices for winner market (BigInt versions)
 * @dev Converts number constants to BigInt for contract interactions
 */
export const WINNER_OUTCOMES = {
  HOME: BigInt(MATCH_WINNER_OUTCOMES.HOME),
  DRAW: BigInt(MATCH_WINNER_OUTCOMES.DRAW),
  AWAY: BigInt(MATCH_WINNER_OUTCOMES.AWAY),
} as const;

/**
 * @notice Outcome indices for over/under market (BigInt versions)
 */
export const OVER_UNDER_OUTCOMES_BIGINT = {
  OVER: BigInt(OVER_UNDER_OUTCOMES.OVER),
  UNDER: BigInt(OVER_UNDER_OUTCOMES.UNDER),
} as const;

/**
 * @notice Outcome indices for BTTS market (BigInt versions)
 */
export const BTTS_OUTCOMES_BIGINT = {
  YES: BigInt(BTTS_OUTCOMES.YES),
  NO: BigInt(BTTS_OUTCOMES.NO),
} as const;

// Re-export constants for convenience
export { BET_PERCENTAGES, BETTING_LIMITS, MARKET_NAMES, OVER_UNDER_OUTCOMES, BTTS_OUTCOMES };

/**
 * @notice Get team data from FAN_TOKENS
 * @dev Searches for team in fan tokens list
 * @param teamName Team name to search
 * @return Team data or undefined
 */
export function getTeamData(teamName: string): FanTokenData | undefined {
  for (const tokenMap of FAN_TOKENS) {
    const symbol = Object.keys(tokenMap)[0];
    const data = tokenMap[symbol];
    if (data.name.includes(teamName) || teamName.includes(symbol)) {
      return data;
    }
  }
  return undefined;
}

/**
 * @notice Convert team selection to contract outcome index
 * @dev Maps team symbol to 0/1/2 for winner market
 * @param teamSymbol Selected team symbol or "Draw"
 * @param teamAName Home team name
 * @param teamBName Away team name
 * @return Outcome index as BigInt
 */
export function getOutcomeIndex(teamSymbol: string, teamAName: string, teamBName: string): bigint {
  const teamAData = getTeamData(teamAName);
  const teamBData = getTeamData(teamBName);
  const teamASymbol = teamAData?.symbol ?? teamAName;
  const teamBSymbol = teamBData?.symbol ?? teamBName;

  if (teamSymbol === teamASymbol) return WINNER_OUTCOMES.HOME;
  if (teamSymbol === "Draw") return WINNER_OUTCOMES.DRAW;
  if (teamSymbol === teamBSymbol) return WINNER_OUTCOMES.AWAY;

  throw new Error(`Unknown team symbol: ${teamSymbol}`);
}

/**
 * @notice Calculate dynamic font size for amount input
 * @dev Scales font based on input length
 * @param amount Amount string
 * @return Font size in rem
 */
export function calculateAmountFontSize(amount: string): number {
  const length = amount.length;
  if (length <= 4) return 3;
  if (length <= 6) return 2.5;
  if (length <= 8) return 2;
  return 1.5;
}

/**
 * @notice Calculate percentage of max amount
 * @dev Helper for percentage buttons (25%, 50%, 75%, 100%)
 * @param maxAmount Maximum available amount
 * @param percentage Percentage to calculate (0-100)
 * @return Calculated amount
 */
export function calculatePercentageAmount(maxAmount: number, percentage: number): number {
  return (maxAmount * percentage) / 100;
}
