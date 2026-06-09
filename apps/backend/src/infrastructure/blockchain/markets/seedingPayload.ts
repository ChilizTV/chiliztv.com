import { keccak256, toBytes } from 'viem';
import { getDefaultFootballMarkets } from '@chiliztv/domain/markets/DefaultMarkets';

/**
 * Domain-level market type names → 32-byte hashes consumed by the
 * PariMatchBase Solidity constants (e.g. `MARKET_WINNER =
 * keccak256("WINNER")`). The names cross the domain boundary as strings —
 * this helper lives in infrastructure because it depends on viem.
 */
export function hashMarketTypeName(name: string): `0x${string}` {
    return keccak256(toBytes(name));
}

export interface FootballSeedingPayload {
    readonly hashes: ReadonlyArray<`0x${string}`>;
    readonly lines: ReadonlyArray<number>;
    readonly marketIds: ReadonlyArray<bigint>;
}

/**
 * Build the seeding payload for a freshly-deployed FootballPariMatch proxy.
 *
 *   - `isKnockout: false` → 8 base markets (marketIds 0..7)
 *   - `isKnockout: true`  → same 8 markets + marketId 8 = FULL_TIME_WINNER
 *
 * Both arrays are aligned 1:1 — `addMarketsBatch` walks them in order so
 * `marketIds[i]` corresponds to `hashes[i]` and `lines[i]`. Length is
 * deterministic on the input flag (8 or 9).
 */
export function getFootballSeedingPayload(opts: { isKnockout: boolean }): FootballSeedingPayload {
    const specs = getDefaultFootballMarkets(opts);
    return {
        hashes: specs.map(s => hashMarketTypeName(s.marketTypeName)),
        lines: specs.map(s => s.line),
        marketIds: specs.map(s => BigInt(s.marketId)),
    };
}

/**
 * Pre-derived seeding payload for the non-knockout case (8 markets).
 * Kept for backwards compatibility with call-sites that don't yet thread
 * the knockout flag. New code should prefer {@link getFootballSeedingPayload}.
 *
 *   - `hashes[i]`     → bytes32 market type for marketId i
 *   - `lines[i]`      → encoded line / variant for marketId i
 *   - `marketIds[i]`  → bigint(i), pre-cast for openMarketsBatch
 *
 * Length is invariant at 8 (= base lineup).
 */
export const FOOTBALL_SEEDING_PAYLOAD: FootballSeedingPayload = getFootballSeedingPayload({ isKnockout: false });
