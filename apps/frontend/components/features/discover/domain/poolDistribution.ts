import {
    MARKET_TYPE_HASHES,
    type MarketPoolSnapshot,
} from "@/lib/contracts/markets";
import type { MarketPoolsDto } from "@chiliztv/shared";
import type { BrowseMatchDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";

const WINNER_HASH = MARKET_TYPE_HASHES.WINNER.toLowerCase();

/**
 * Pick the WINNER market snapshot from a per-contract pools DTO. Kept for
 * code that specifically needs the 1X2 reference (e.g. cosmetic odds fallback
 * which only has home/draw/away odds).
 */
export function pickWinnerSnapshot(
    pools: MarketPoolsDto | undefined,
): MarketPoolSnapshot | null {
    if (!pools) return null;
    return (
        pools.markets.find((m) => m.marketType.toLowerCase() === WINNER_HASH) ?? null
    );
}

/**
 * Pick the snapshot we want to feature on the browse card: WINNER when it
 * has liquidity, otherwise the first market with a non-zero total pool.
 * Returns the WINNER row (possibly empty) when nothing has activity yet,
 * so the caller can fall back to the cosmetic odds path.
 */
export function pickRichestMarketSnapshot(
    pools: MarketPoolsDto | undefined,
): MarketPoolSnapshot | null {
    if (!pools) return null;
    const winner = pools.markets.find((m) => m.marketType.toLowerCase() === WINNER_HASH);
    if (winner && BigInt(winner.totalPool) > BigInt(0)) return winner;
    const richest = pools.markets.find((m) => BigInt(m.totalPool) > BigInt(0));
    if (richest) return richest;
    return winner ?? null;
}

export interface PoolShares {
    /** One share per outcome — length matches the market's outcome count. */
    readonly shares: readonly number[];
    readonly favIdx: number;
}

/**
 * Turn the backend's `impliedProbBps` (basis points) into normalised shares
 * summing to ≤ 1. Returns `null` when the pool has no liquidity yet so the
 * caller can fall back to the reference-odds path. Variable length: 3 for
 * WINNER / HALFTIME, 2 for GOALS_TOTAL / BOTH_SCORE, etc.
 */
export function sharesFromSnapshot(
    snapshot: MarketPoolSnapshot,
): PoolShares | null {
    if (!snapshot.totalPool || BigInt(snapshot.totalPool) === BigInt(0)) return null;
    const bps = snapshot.impliedProbBps;
    if (bps.length === 0) return null;
    const shares = bps.map((b) => b / 10_000);
    let favIdx = 0;
    for (let i = 1; i < shares.length; i++) {
        if (shares[i] > shares[favIdx]) favIdx = i;
    }
    return { shares, favIdx };
}

/**
 * Devigorize three-way decimal odds into a probability triplet — used as
 * the empty-pool cosmetic fallback (CLAUDE.md §6 + how-it-works copy).
 * Returns null when any leg is missing.
 */
export function sharesFromOddsRef(odds: BrowseMatchDto["odds"]): PoolShares | null {
    if (!odds) return null;
    const { home, draw, away } = odds;
    if (home == null || draw == null || away == null) return null;
    if (home <= 0 || draw <= 0 || away <= 0) return null;
    const inverse = [1 / home, 1 / draw, 1 / away];
    const total = inverse[0] + inverse[1] + inverse[2];
    if (total <= 0) return null;
    const shares: number[] = [
        inverse[0] / total,
        inverse[1] / total,
        inverse[2] / total,
    ];
    let favIdx = 0;
    if (shares[1] > shares[favIdx]) favIdx = 1;
    if (shares[2] > shares[favIdx]) favIdx = 2;
    return { shares, favIdx };
}
