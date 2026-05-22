import type { MarketPoolSnapshot } from './types';

/**
 * Implied probability per outcome derived from the live pool ratios. Each
 * value is a number in [0, 1] — UI is expected to multiply by 100 for the
 * percentage display.
 *
 * Returns an empty Map when `totalPool == 0` so the caller can fallback on
 * a sharp-book reference odds hint (cf. BetSelectionStep three-mode display
 * in F3.6).
 */
export function impliedProbsFromPool(snapshot: MarketPoolSnapshot): Map<bigint, number> {
    const out = new Map<bigint, number>();
    if (!snapshot.totalPool || BigInt(snapshot.totalPool) === BigInt(0)) return out;
    snapshot.impliedProbBps.forEach((bps, idx) => {
        out.set(BigInt(idx), bps / 10_000);
    });
    return out;
}

/**
 * Outcome pool sizes as bigints, indexed by outcome. Convenience wrapper
 * around the `outcomePools: string[]` shape of the wire DTO.
 */
export function outcomePoolsFromSnapshot(snapshot: MarketPoolSnapshot): Map<bigint, bigint> {
    const out = new Map<bigint, bigint>();
    snapshot.outcomePools.forEach((raw, idx) => {
        out.set(BigInt(idx), BigInt(raw));
    });
    return out;
}
