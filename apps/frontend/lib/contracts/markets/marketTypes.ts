import { keccak256, toBytes } from 'viem';
import type { MarketSpec, MarketOutcome } from './types';

// Hashes are computed once at module load. The strings match the
// `bytes32 public constant` declarations in FootballPariMatch.sol (lines
// 40-46) and BasketballPariMatch.sol (lines 45-51) — `keccak256("WINNER")`
// with no prefix or padding. Unit tests assert byte-equality against the
// on-chain constants via the generated wagmi hooks.
export const MARKET_TYPE_HASHES = {
    WINNER: keccak256(toBytes('WINNER')),
    GOALS_TOTAL: keccak256(toBytes('GOALS_TOTAL')),
    BOTH_SCORE: keccak256(toBytes('BOTH_SCORE')),
    HALFTIME: keccak256(toBytes('HALFTIME')),
    FIRST_SCORER: keccak256(toBytes('FIRST_SCORER')),
    CORRECT_SCORE: keccak256(toBytes('CORRECT_SCORE')),
    GOALS_EXACT: keccak256(toBytes('GOALS_EXACT')),
    TOTAL_POINTS: keccak256(toBytes('TOTAL_POINTS')),
    SPREAD: keccak256(toBytes('SPREAD')),
    QUARTER_WINNER: keccak256(toBytes('QUARTER_WINNER')),
    FIRST_TO_SCORE: keccak256(toBytes('FIRST_TO_SCORE')),
    HIGHEST_QUARTER: keccak256(toBytes('HIGHEST_QUARTER')),
    POINTS_EXACT: keccak256(toBytes('POINTS_EXACT')),
} as const;

/** Markets that exist on-chain but the front silently filters out. */
export const HIDDEN_MARKETS: ReadonlySet<string> = new Set([
    MARKET_TYPE_HASHES.CORRECT_SCORE.toLowerCase(),
]);

/** True for any market the front should not list, dialog, or include in dashboards. */
export function isHiddenMarket(marketTypeHash: string | undefined): boolean {
    if (!marketTypeHash) return false;
    return HIDDEN_MARKETS.has(marketTypeHash.toLowerCase());
}

// Selection conventions (must match the resolver / setup admin scripts):
//   WINNER, HALFTIME : 0=Home, 1=Draw, 2=Away
//   GOALS_TOTAL      : 0=Under, 1=Over   (line = tenths of goals — 25 ⇒ 2.5)
//   BOTH_SCORE       : 0=No,    1=Yes
//   FIRST_SCORER     : 0=Home,  1=Away,  2=No goal (simplified — contract supports 0..255)
//
// CORRECT_SCORE is in MARKET_TYPE_HASHES but not in FOOTBALL_MARKETS — it is
// listed in HIDDEN_MARKETS and filtered everywhere on the front (D1 of plan).

const winnerOutcomes = (homeTeam?: string, awayTeam?: string): ReadonlyArray<MarketOutcome> => [
    { selection: 0, label: homeTeam ?? 'Home', hint: 'Home win' },
    { selection: 1, label: 'Draw', hint: 'Tie' },
    { selection: 2, label: awayTeam ?? 'Away', hint: 'Away win' },
];

export const FOOTBALL_MARKETS: Readonly<Record<string, MarketSpec>> = {
    [MARKET_TYPE_HASHES.WINNER.toLowerCase()]: {
        key: 'winner',
        label: 'Match Result',
        hint: 'Home / Draw / Away',
        hasLine: false,
        supportsBetting: true,
        getOutcomes: (_line, homeTeam, awayTeam) => winnerOutcomes(homeTeam, awayTeam),
    },
    [MARKET_TYPE_HASHES.HALFTIME.toLowerCase()]: {
        key: 'halftime',
        label: 'Halftime Result',
        hint: 'Score at half',
        hasLine: false,
        supportsBetting: true,
        getOutcomes: (_line, homeTeam, awayTeam) => winnerOutcomes(homeTeam, awayTeam),
    },
    [MARKET_TYPE_HASHES.GOALS_TOTAL.toLowerCase()]: {
        key: 'goalstotal',
        label: 'Total Goals',
        hint: 'Over / Under',
        hasLine: true,
        supportsBetting: true,
        getOutcomes: (line) => {
            const ln = (line / 10).toFixed(1);
            return [
                { selection: 0, label: `Under ${ln}`, hint: 'Fewer goals' },
                { selection: 1, label: `Over ${ln}`, hint: 'More goals' },
            ];
        },
    },
    [MARKET_TYPE_HASHES.BOTH_SCORE.toLowerCase()]: {
        key: 'bothscore',
        label: 'Both Teams Score',
        hint: 'Yes / No',
        hasLine: false,
        supportsBetting: true,
        getOutcomes: () => [
            { selection: 0, label: 'No', hint: 'At least one shut out' },
            { selection: 1, label: 'Yes', hint: 'Both teams score' },
        ],
    },
    [MARKET_TYPE_HASHES.FIRST_SCORER.toLowerCase()]: {
        key: 'firstscorer',
        label: 'First Goal',
        hint: 'Home / Away / None',
        hasLine: false,
        supportsBetting: true,
        getOutcomes: (_line, homeTeam, awayTeam) => [
            { selection: 0, label: homeTeam ?? 'Home', hint: 'Scores first' },
            { selection: 1, label: awayTeam ?? 'Away', hint: 'Scores first' },
            { selection: 2, label: 'No goal', hint: '0-0 at full time' },
        ],
    },
    // New in parimutuel: bucketed total goals (line = max bucket index).
    // Outcomes 0..line are rendered with generic numeric labels — UI fallback
    // until a dedicated bucket picker ships.
    [MARKET_TYPE_HASHES.GOALS_EXACT.toLowerCase()]: {
        key: 'goalsexact',
        label: 'Goals Exact',
        hint: 'Bucket par tranche',
        hasLine: true,
        supportsBetting: true,
        getOutcomes: (line) => {
            const maxBucket = Math.max(0, Math.min(line, 99));
            return Array.from({ length: maxBucket + 1 }, (_v, idx) => ({
                selection: idx,
                label: idx === maxBucket ? `${idx}+` : `${idx}`,
                hint: idx === maxBucket ? `${idx} or more goals` : `Exactly ${idx} goals`,
            }));
        },
    },
};

export const BASKETBALL_MARKETS: Readonly<Record<string, MarketSpec>> = {
    [MARKET_TYPE_HASHES.WINNER.toLowerCase()]: {
        key: 'bb-winner',
        label: 'Winner',
        hint: 'Home / Away',
        hasLine: false,
        supportsBetting: true,
        getOutcomes: (_line, homeTeam, awayTeam) => [
            { selection: 0, label: homeTeam ?? 'Home', hint: 'Home win' },
            { selection: 1, label: awayTeam ?? 'Away', hint: 'Away win' },
        ],
    },
    [MARKET_TYPE_HASHES.TOTAL_POINTS.toLowerCase()]: {
        key: 'totalpoints',
        label: 'Total Points',
        hint: 'Over / Under',
        hasLine: true,
        supportsBetting: true,
        getOutcomes: (line) => {
            const ln = (line / 10).toFixed(1);
            return [
                { selection: 0, label: `Under ${ln}`, hint: 'Fewer points' },
                { selection: 1, label: `Over ${ln}`, hint: 'More points' },
            ];
        },
    },
    [MARKET_TYPE_HASHES.SPREAD.toLowerCase()]: {
        key: 'spread',
        label: 'Spread',
        hint: 'Home covers / Away covers',
        hasLine: true,
        supportsBetting: true,
        getOutcomes: (line, homeTeam, awayTeam) => {
            const ln = (line / 10).toFixed(1);
            return [
                { selection: 0, label: `${homeTeam ?? 'Home'} ${ln}`, hint: 'Home covers spread' },
                { selection: 1, label: `${awayTeam ?? 'Away'} -${ln}`, hint: 'Away covers spread' },
            ];
        },
    },
};

/**
 * Returns the spec for a known football OR basketball market. Falls back to
 * `null` for hidden markets (CORRECT_SCORE) or genuinely unknown types — the
 * caller is expected to render `GenericOutcomePicks` in the latter case.
 */
export function getMarketSpec(marketTypeHash: string | undefined): MarketSpec | null {
    if (!marketTypeHash) return null;
    const key = marketTypeHash.toLowerCase();
    return FOOTBALL_MARKETS[key] ?? BASKETBALL_MARKETS[key] ?? null;
}
