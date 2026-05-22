/**
 * PariMatchBase uses a single `_claimed[marketId][user]` flag for both
 * payout claims (Resolved markets) and refund claims (Cancelled markets).
 * The UI needs to disambiguate the two states from the market state.
 */
export const MarketState = {
    Inactive: 0,
    Open: 1,
    Suspended: 2,
    Closed: 3,
    Resolved: 4,
    Cancelled: 5,
} as const;
export type MarketStateValue = (typeof MarketState)[keyof typeof MarketState];

export type ClaimKind = 'payout' | 'refund' | 'none';

export function deriveClaimKind(state: number, hasClaimed: boolean): ClaimKind {
    if (!hasClaimed) return 'none';
    if (state === MarketState.Resolved) return 'payout';
    if (state === MarketState.Cancelled) return 'refund';
    // Open/Suspended/Closed with hasClaimed=true should not happen — the
    // contract rejects claims before resolution. Defensive 'none' fallback.
    return 'none';
}
