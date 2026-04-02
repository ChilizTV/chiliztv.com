import { FAN_TOKENS, FanTokenData } from "@/utils/FanTokens";
import type { TokenPriceData } from "@/services";
import { convertCHZtoUSD } from "@/lib/utils/formatting/price";

/**
 * @notice Format number with locale-specific formatting
 * @dev Uses US locale formatting for client-side rendering
 * @param num Number to format
 * @param isClient Whether rendering on client side
 * @return Formatted number string
 */
export function formatNumber(num: number, isClient: boolean): string {
  if (!isClient) return num.toString();
  return num.toLocaleString("en-US");
}

/**
 * @notice Convert FAN_TOKENS array to flat symbol-to-data map
 * @dev Transforms array of token maps into single lookup object
 * @return Flat map of token symbols to token data
 */
export function getFlatFanTokenMap(): { [symbol: string]: FanTokenData } {
  return FAN_TOKENS.reduce((acc, tokenMap) => {
    const key = Object.keys(tokenMap)[0];
    acc[key] = tokenMap[key];
    return acc;
  }, {} as { [symbol: string]: FanTokenData });
}

/**
 * @notice Display format for token with balance and price data
 */
export interface TokenDisplay {
  id: number;
  team: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  change: number;
  logo: string;
}

/**
 * @notice Map token balances to display format with metadata and prices
 * @dev Filters out zero balances, enriches with token data and price information
 * @param tokenBalances Array of user token balances
 * @param tokenPrices Map of token symbols to price data
 * @return Array of tokens in display format
 */
export function mapTokenBalancesToDisplay(
  tokenBalances: Array<{ symbol: string; balance: number }>,
  tokenPrices: { [symbol: string]: TokenPriceData }
): TokenDisplay[] {
  const flatFanTokenMap = getFlatFanTokenMap();

  return tokenBalances
    .filter((tokenBalance) => tokenBalance.balance > 0)
    .map((tokenBalance, index) => {
      const tokenData = flatFanTokenMap[tokenBalance.symbol];
      const priceData = tokenPrices[tokenBalance.symbol.toUpperCase()];

      if (!tokenData) {
        return {
          id: index + 1,
          team: tokenBalance.symbol,
          symbol: tokenBalance.symbol,
          quantity: tokenBalance.balance,
          currentPrice: priceData?.price || 0,
          change: priceData?.priceChangePercent24h || 0,
          logo: "",
        };
      }

      return {
        id: index + 1,
        team: tokenData.name.replace(" Fan Token", ""),
        symbol: tokenBalance.symbol,
        quantity: tokenBalance.balance,
        currentPrice: priceData?.price || 0,
        change: priceData?.priceChangePercent24h || 0,
        logo: tokenData.image,
      };
    });
}

/**
 * @notice Calculate total value of all fan tokens
 * @dev Sums quantity * currentPrice for each token
 * @param tokens Array of tokens in display format
 * @return Total value in USD
 */
export function calculateFanTokensValue(tokens: TokenDisplay[]): number {
  return tokens.reduce((sum, token) => sum + token.quantity * token.currentPrice, 0);
}

/**
 * @notice Calculate total portfolio value including fan tokens and CHZ
 * @dev Adds fan tokens value + (CHZ balance * CHZ price)
 * @param fanTokensValue Total value of fan tokens in USD
 * @param chzBalance CHZ balance as formatted string
 * @param chzPrice Current CHZ price in USD
 * @return Total portfolio value in USD
 */
export function calculateTotalPortfolioValue(
  fanTokensValue: number,
  chzBalance: string | undefined,
  chzPrice: number
): number {
  let totalValue = fanTokensValue;

  if (chzBalance && chzPrice > 0) {
    const chzBalanceNum = parseFloat(chzBalance || "0");
    const chzValue = convertCHZtoUSD(chzBalanceNum, chzPrice);
    totalValue += chzValue;
  }

  return totalValue;
}
