import { formatUnits } from "viem";

/**
 * The BettingMatch pools are denominated in the same token as the LiquidityPool
 * collateral (USDC). The on-chain decimals must be passed in by the caller —
 * Spicy test USDC is 18-decimal while mainnet (Circle) USDC is 6-decimal, so a
 * hardcoded constant breaks one of the two environments. Read the live value
 * via `usePoolDecimals().assetDecimals` and forward it here.
 */
export const BET_TOKEN_SYMBOL = "USDC";

export function formatBetAmount(value: bigint | undefined, decimals: number | undefined): string {
  if (value === undefined || decimals === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  if (n === 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}
