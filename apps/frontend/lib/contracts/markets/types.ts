/** Symbolic key used in the catalog (kebab-style on-chain hash mapped to lower-case). */
export type MarketKey =
    | 'winner'
    | 'goalstotal'
    | 'bothscore'
    | 'halftime'
    | 'firstscorer';

/** A single picker option rendered by `BetSelectionStep`. */
export interface MarketOutcome {
    readonly selection: number;
    readonly label: string;
    readonly hint?: string;
}

/** Catalog row for one football market type. */
export interface MarketSpec {
    readonly key: MarketKey;
    /** Human-readable label rendered as the row title (e.g. "Match Result"). */
    readonly label: string;
    /** Short hint shown under the label (e.g. "Home / Draw / Away"). */
    readonly hint: string;
    /** True when the contract's `line` field carries semantic meaning (only GOALS_TOTAL today). */
    readonly hasLine: boolean;
    /** Whether the front exposes a Predict CTA for this market. CORRECT_SCORE is hidden, not "unsupported". */
    readonly supportsBetting: boolean;
    /** `int16 line` from the contract (tenths — 25 = 2.5). 0 when n/a. */
    getOutcomes(line: number, homeTeam?: string, awayTeam?: string): ReadonlyArray<MarketOutcome>;
}

/** Mirrors `enum SportType` in BettingMatchFactory.sol. */
export enum SportType {
    FOOTBALL = 0,
    BASKETBALL = 1,
}
