/**
 * Static USDC decimals helper. In the bookmaker era this hook hit
 * LiquidityPool.asset() + LiquidityPool.decimals() to discover the asset
 * mint dynamically. In the parimutuel model the contract is hardcoded to
 * USDC (6 decimals) — the dynamic read is unnecessary and was costing one
 * RPC roundtrip per component render.
 *
 * Kept as a hook (not a constant) so call-sites that already destructure
 * { assetDecimals, shareDecimals } don't need rewriting.
 */
export interface PoolDecimals {
    /** USDC raw decimals (settlement currency). */
    readonly assetDecimals: number;
    /**
     * Share decimals — kept for backward compat with code that used the LP
     * ERC-4626 shares (ctvLP had 12 effective decimals). In parimutuel there
     * are no shares, so the value is 6 (matches the stake-amount column).
     */
    readonly shareDecimals: number;
}

const USDC_DECIMALS = 6;

export function usePoolDecimals(): PoolDecimals {
    return { assetDecimals: USDC_DECIMALS, shareDecimals: USDC_DECIMALS };
}
