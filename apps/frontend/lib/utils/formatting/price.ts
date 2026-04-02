/**
 * @notice Price and currency formatting utilities
 * @dev Handles CHZ, USD, and token price conversions
 */

/**
 * @notice Format CHZ amount with symbol
 * @param amount CHZ amount
 * @param decimals Number of decimal places (default 4)
 * @return Formatted CHZ string
 */
export function formatCHZPrice(amount: number, decimals: number = 4): string {
  return `${amount.toFixed(decimals)} CHZ`;
}

/**
 * @notice Format USD value with $ symbol
 * @param value USD value
 * @param decimals Number of decimal places (default 2)
 * @return Formatted USD string
 */
export function formatUSDValue(value: number, decimals: number = 2): string {
  return `$${value.toFixed(decimals)}`;
}

/**
 * @notice Convert CHZ to USD value
 * @param chzAmount CHZ amount
 * @param chzPrice CHZ price in USD
 * @return USD value
 */
export function convertCHZtoUSD(chzAmount: number, chzPrice: number): number {
  return chzAmount * chzPrice;
}

/**
 * @notice Convert USD to CHZ amount
 * @param usdAmount USD amount
 * @param chzPrice CHZ price in USD
 * @return CHZ amount
 */
export function convertUSDtoCHZ(usdAmount: number, chzPrice: number): number {
  return usdAmount / chzPrice;
}

/**
 * @notice Format token balance with locale formatting
 * @param balance Token balance
 * @param decimals Number of decimal places (default 2)
 * @return Formatted balance string
 */
export function formatTokenBalance(balance: number, decimals: number = 2): string {
  return balance.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
