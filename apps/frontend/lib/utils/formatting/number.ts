/**
 * @notice Number formatting utilities
 * @dev Provides consistent number display across the app
 */

/**
 * @notice Format large numbers with locale formatting
 * @param num Number to format
 * @return Formatted number string with commas
 */
export function formatLargeNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * @notice Format percentage value
 * @param value Percentage value (0-100)
 * @param decimals Number of decimal places (default 1)
 * @return Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * @notice Abbreviate large numbers (1K, 1M, 1B)
 * @param num Number to abbreviate
 * @return Abbreviated number string
 */
export function abbreviateNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * @notice Format number with fixed decimal places
 * @param num Number to format
 * @param decimals Number of decimal places
 * @return Formatted number string
 */
export function formatDecimal(num: number, decimals: number): string {
  return num.toFixed(decimals);
}

/**
 * @notice Clamp number between min and max
 * @param num Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @return Clamped value
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}
