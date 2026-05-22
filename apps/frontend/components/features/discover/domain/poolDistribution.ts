import {
    MARKET_TYPE_HASHES,
    type MarketPoolSnapshot,
} from "@/lib/contracts/markets";
import type { MarketPoolsDto } from "@chiliztv/shared";
import type { BrowseMatchDto } from "@chiliztv/shared/dto/matches/BrowseMatchesDto";

const WINNER_HASH = MARKET_TYPE_HASHES.WINNER.toLowerCase();

/**
 * Pick the WINNER market snapshot from a per-contract pools DTO. Discover
 * cards visualise the 1X2 distribution exclusively — other markets
 * (GOALS_TOTAL, BOTH_SCORE…) are surfaced on the live-match page, not here.
 */
export function pickWinnerSnapshot(
    pools: MarketPoolsDto | undefined,
): MarketPoolSnapshot | null {
    if (!pools) return null;
    return (
        pools.markets.find((m) => m.marketType.toLowerCase() === WINNER_HASH) ?? null
    );
}

export interface PoolShares {
    readonly shares: readonly [number, number, number];
    readonly favIdx: 0 | 1 | 2;
}

/**
 * Turn the backend's `impliedProbBps` (basis points) into three normalised
 * shares summing to ≤ 1. Returns `null` when the pool has no liquidity yet
 * so the caller can fall back to the reference-odds path.
 */
export function sharesFromSnapshot(
    snapshot: MarketPoolSnapshot,
): PoolShares | null {
    if (!snapshot.totalPool || BigInt(snapshot.totalPool) === BigInt(0)) return null;
    const bps = snapshot.impliedProbBps;
    if (bps.length < 3) return null;
    const shares: [number, number, number] = [
        bps[0] / 10_000,
        bps[1] / 10_000,
        bps[2] / 10_000,
    ];
    let favIdx: 0 | 1 | 2 = 0;
    if (shares[1] > shares[favIdx]) favIdx = 1;
    if (shares[2] > shares[favIdx]) favIdx = 2;
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
    const shares: [number, number, number] = [
        inverse[0] / total,
        inverse[1] / total,
        inverse[2] / total,
    ];
    let favIdx: 0 | 1 | 2 = 0;
    if (shares[1] > shares[favIdx]) favIdx = 1;
    if (shares[2] > shares[favIdx]) favIdx = 2;
    return { shares, favIdx };
}
