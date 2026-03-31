/**
 * @notice Mock data and utility functions for leaderboard
 * @dev Contains predictor rankings, token holders, and helper functions
 */

/**
 * @notice Predictor leaderboard entry interface
 */
export interface PredictorEntry {
  rank: number;
  username: string;
  avatar: string;
  totalWinnings: number;
  winRate: number;
  totalPredictions: number;
  favoriteTeam: string;
  streak: number;
}

/**
 * @notice Token holder leaderboard entry interface
 */
export interface TokenHolderEntry {
  rank: number;
  username: string;
  avatar: string;
  totalTokens: number;
  portfolioValue: number;
  topToken: string;
  tokensHeld: number;
}

/**
 * @notice Mock data for top predictors
 * @dev Will be replaced with real API data in production
 */
export const mockTopPredictors: PredictorEntry[] = [
  {
    rank: 1,
    username: "FootballKing",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 45230.5,
    winRate: 78.5,
    totalPredictions: 342,
    favoriteTeam: "PSG",
    streak: 12,
  },
  {
    rank: 2,
    username: "PredictionMaster2024",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 38920.75,
    winRate: 74.2,
    totalPredictions: 298,
    favoriteTeam: "BAR",
    streak: 8,
  },
  {
    rank: 3,
    username: "PredictionChampion",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 32156.9,
    winRate: 71.8,
    totalPredictions: 267,
    favoriteTeam: "JUV",
    streak: 5,
  },
  {
    rank: 4,
    username: "StrategyGuru",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 28775.25,
    winRate: 69.3,
    totalPredictions: 245,
    favoriteTeam: "PSG",
    streak: 15,
  },
  {
    rank: 5,
    username: "LivePredictionPro",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 25890.4,
    winRate: 67.1,
    totalPredictions: 223,
    favoriteTeam: "BAR",
    streak: 3,
  },
  {
    rank: 6,
    username: "GoalPredictor",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 23456.8,
    winRate: 65.9,
    totalPredictions: 201,
    favoriteTeam: "JUV",
    streak: 7,
  },
  {
    rank: 7,
    username: "MatchAnalyst",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 21234.15,
    winRate: 64.2,
    totalPredictions: 189,
    favoriteTeam: "PSG",
    streak: 2,
  },
  {
    rank: 8,
    username: "WinningStreaker",
    avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 19876.5,
    winRate: 62.8,
    totalPredictions: 176,
    favoriteTeam: "BAR",
    streak: 9,
  },
  {
    rank: 9,
    username: "SportsFanatic",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 18567.3,
    winRate: 61.5,
    totalPredictions: 164,
    favoriteTeam: "JUV",
    streak: 4,
  },
  {
    rank: 10,
    username: "WinStreakHero",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=64&h=64&fit=crop&crop=face",
    totalWinnings: 17234.7,
    winRate: 60.1,
    totalPredictions: 152,
    favoriteTeam: "PSG",
    streak: 6,
  },
];

/**
 * @notice Mock data for top token holders
 * @dev Will be replaced with real API data in production
 */
export const mockTopTokenHolders: TokenHolderEntry[] = [
  {
    rank: 1,
    username: "TokenCollector",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face",
    totalTokens: 15420,
    portfolioValue: 89234.5,
    topToken: "PSG",
    tokensHeld: 3,
  },
  {
    rank: 2,
    username: "FanTokenKing",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616c77073b3?w=64&h=64&fit=crop&crop=face",
    totalTokens: 12850,
    portfolioValue: 76890.25,
    topToken: "BAR",
    tokensHeld: 3,
  },
  {
    rank: 3,
    username: "PortfolioMaster",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=64&h=64&fit=crop&crop=face",
    totalTokens: 11234,
    portfolioValue: 65432.1,
    topToken: "JUV",
    tokensHeld: 2,
  },
  {
    rank: 4,
    username: "InvestorPro",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    totalTokens: 9876,
    portfolioValue: 54321.8,
    topToken: "PSG",
    tokensHeld: 3,
  },
  {
    rank: 5,
    username: "TokenTrader",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    totalTokens: 8765,
    portfolioValue: 48750.6,
    topToken: "BAR",
    tokensHeld: 2,
  },
];

/**
 * @notice Format number with locale-specific formatting
 * @param num Number to format
 * @return Formatted string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * @notice Format currency value to USD
 * @param value Numeric value to format
 * @return Formatted USD string
 */
export function formatUSD(value: number): string {
  return `$${value.toLocaleString()}`;
}
