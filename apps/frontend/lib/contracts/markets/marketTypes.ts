import { keccak256, toBytes } from 'viem';
import type { MarketKey, MarketSpec, MarketOutcome } from './types';

// Hashes are computed once at module load — viem's keccak256 is deterministic
// and the strings match the `bytes32 public constant` declarations in
// FootballMatch.sol. The unit tests assert these match the on-chain values.
export const MARKET_TYPE_HASHES = {
    WINNER: keccak256(toBytes('WINNER')),
    GOALS_TOTAL: keccak256(toBytes('GOALS_TOTAL')),
    BOTH_SCORE: keccak256(toBytes('BOTH_SCORE')),
    HALFTIME: keccak256(toBytes('HALFTIME')),
    FIRST_SCORER: keccak256(toBytes('FIRST_SCORER')),
    CORRECT_SCORE: keccak256(toBytes('CORRECT_SCORE')),
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
};

/** Returns the spec or `null` for unknown / hidden / basketball markets. */
export function getMarketSpec(marketTypeHash: string | undefined): MarketSpec | null {
    if (!marketTypeHash) return null;
    return FOOTBALL_MARKETS[marketTypeHash.toLowerCase()] ?? null;
}
