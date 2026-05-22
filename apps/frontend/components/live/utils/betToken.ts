import { formatUnits } from "viem";

/**
 * PariMatch pools are hardcoded to USDC (6 dp). `usePoolDecimals()` is the
 * canonical source — kept as a hook so call-sites that already destructure
 * `assetDecimals` don't need rewriting.
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
