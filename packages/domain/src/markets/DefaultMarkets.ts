/**
 * Canonical lineup of markets seeded on every freshly-deployed
 * FootballPariMatch contract. PredCast exposes EXACTLY these 6 product
 * types (8 markets because GOALS_TOTAL has 2 lines and DOUBLE_CHANCE has 3
 * variants):
 *
 *   1. 1X2                                          (WINNER)
 *   2. 1X2 mi-temps                                  (HALFTIME)
 *   3. Over/Under 1.5 goals                          (GOALS_TOTAL line=15)
 *   4. Over/Under 2.5 goals                          (GOALS_TOTAL line=25)
 *   5. Both teams score                              (BOTH_SCORE)
 *   6. Double Chance — 1X, 12, 2X                    (DOUBLE_CHANCE × 3)
 *
 * The order below IS the on-chain `marketId` order (addMarketsBatch indexes
 * 0..N). Re-ordering this list changes which market a placed bet refers to
 * — DO NOT reorder casually. The behavioural-equivalence test in
 * apps/backend asserts the 2 adapters consume the same payload, but it
 * does NOT detect a re-order that's coherent across both adapters.
 *
 * Adding a new market type at the end is safe. Inserting in the middle
 * shifts every following marketId — reserved for a separate migration
 * with explicit contract upgrade plan.
 */
export type DefaultMarketTypeName =
    | 'WINNER'
    | 'HALFTIME'
    | 'GOALS_TOTAL'
    | 'BOTH_SCORE'
    | 'DOUBLE_CHANCE'
    | 'FULL_TIME_WINNER';

export interface DefaultMarketSpec {
    /** Sequential index in `addMarketsBatch` — graved as on-chain `marketId`. */
    readonly marketId: number;
    /** Used by the infra helper: `keccak256(marketTypeName)` must equal the Solidity constant. */
    readonly marketTypeName: DefaultMarketTypeName;
    /**
     * Encoding varies by type:
     *   - GOALS_TOTAL: goals tenths × 10 (15 = 1.5 goals, 25 = 2.5)
     *   - DOUBLE_CHANCE: variant index — 0=1X, 1=12, 2=2X
     *   - else: 0 (unused but stored)
     */
    readonly line: number;
    /** Outcome cardinality — highest valid selection is `maxOutcome - 1`. */
    readonly maxOutcome: number;
    /** UI label — used by MatchMarketsList grouping and the activity feed. */
    readonly displayLabel: string;
}

export const DEFAULT_FOOTBALL_MARKETS: ReadonlyArray<DefaultMarketSpec> = [
    { marketId: 0, marketTypeName: 'WINNER',           line: 0,  maxOutcome: 3, displayLabel: '1X2 (90 min)' },
    { marketId: 1, marketTypeName: 'HALFTIME',         line: 0,  maxOutcome: 3, displayLabel: '1X2 Halftime' },
    { marketId: 2, marketTypeName: 'GOALS_TOTAL',      line: 15, maxOutcome: 2, displayLabel: 'O/U 1.5 Goals' },
    { marketId: 3, marketTypeName: 'GOALS_TOTAL',      line: 25, maxOutcome: 2, displayLabel: 'O/U 2.5 Goals' },
    { marketId: 4, marketTypeName: 'BOTH_SCORE',       line: 0,  maxOutcome: 2, displayLabel: 'Both Teams to Score' },
    { marketId: 5, marketTypeName: 'DOUBLE_CHANCE',    line: 0,  maxOutcome: 2, displayLabel: 'Double Chance 1X' },
    { marketId: 6, marketTypeName: 'DOUBLE_CHANCE',    line: 1,  maxOutcome: 2, displayLabel: 'Double Chance 12' },
    { marketId: 7, marketTypeName: 'DOUBLE_CHANCE',    line: 2,  maxOutcome: 2, displayLabel: 'Double Chance 2X' },
    // Knockout-only — seeded ONLY when `isKnockoutMatch(fixture) === true`.
    // See `getFootballSeedingPayload` consumer in infrastructure.
    // Binary outcomes (Home / Away) — no draw possible after AET + PEN.
    { marketId: 8, marketTypeName: 'FULL_TIME_WINNER', line: 0,  maxOutcome: 2, displayLabel: 'Final Winner (incl. AET + PEN)' },
] as const;

/**
 * The `marketId` reserved for HALFTIME. Used by the early-resolution path
 * to close+resolve just that market without touching the other 7.
 */
export const HALFTIME_MARKET_ID = 1 as const;

/**
 * The `marketId` reserved for FULL_TIME_WINNER (knockout-only). Used by the
 * seeding payload helper to filter the market in/out and by indexers /
 * resolvers that special-case it.
 */
export const FULL_TIME_WINNER_MARKET_ID = 8 as const;

/**
 * Returns the seed lineup for a freshly-deployed FootballPariMatch proxy.
 *
 *   - For regular league matches: the 8 base markets (marketIds 0..7).
 *   - For knockout fixtures (`isKnockout === true`): the 8 base markets
 *     PLUS marketId 8 = FULL_TIME_WINNER. The extra market settles on the
 *     true final winner (AET aggregate or penalty shootout result),
 *     complementing the regulation-time WINNER market.
 *
 * Callers MUST pass the `isKnockout` flag computed by `KnockoutMatchPolicy`
 * at match create time — it's frozen on the match row and the proxy is
 * deployed synchronously with this seed (the market list cannot be amended
 * retroactively without a contract upgrade).
 */
export function getDefaultFootballMarkets(opts: { isKnockout: boolean }): ReadonlyArray<DefaultMarketSpec> {
    if (opts.isKnockout) return DEFAULT_FOOTBALL_MARKETS;
    return DEFAULT_FOOTBALL_MARKETS.filter(s => s.marketTypeName !== 'FULL_TIME_WINNER');
}

/**
 * Lookup helper for callers that have a `(marketTypeName, line)` pair (e.g.
 * an event handler from the indexer) and need the canonical spec. Returns
 * null for unknown combinations — legacy contracts may carry market types
 * we no longer seed (FIRST_SCORER, GOALS_EXACT...).
 */
export function findDefaultMarketSpec(marketTypeName: string, line: number): DefaultMarketSpec | null {
    return DEFAULT_FOOTBALL_MARKETS.find(s => s.marketTypeName === marketTypeName && s.line === line) ?? null;
}

/**
 * Convenience: the set of unique market type names actually seeded today.
 * Excludes legacy types (CORRECT_SCORE, FIRST_SCORER, GOALS_EXACT) that the
 * contract still understands but the product no longer exposes.
 */
export const SUPPORTED_MARKET_TYPE_NAMES: ReadonlySet<DefaultMarketTypeName> = new Set(
    DEFAULT_FOOTBALL_MARKETS.map(s => s.marketTypeName),
);
