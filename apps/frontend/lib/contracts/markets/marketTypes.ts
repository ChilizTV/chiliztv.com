import { keccak256, toBytes } from 'viem';
import type { MarketSpec, MarketOutcome } from './types';

// Hashes are computed once at module load. The strings match the
// `bytes32 public constant` declarations in FootballPariMatch.sol (lines
// 40-46) and BasketballPariMatch.sol (lines 45-51) — `keccak256("WINNER")`
// with no prefix or padding. Unit tests assert byte-equality against the
// on-chain constants via the generated wagmi hooks.
export const MARKET_TYPE_HASHES = {
    WINNER: keccak256(toBytes('WINNER')),
    FULL_TIME_WINNER: keccak256(toBytes('FULL_TIME_WINNER')),
    GOALS_TOTAL: keccak256(toBytes('GOALS_TOTAL')),
    BOTH_SCORE: keccak256(toBytes('BOTH_SCORE')),
    HALFTIME: keccak256(toBytes('HALFTIME')),
    DOUBLE_CHANCE: keccak256(toBytes('DOUBLE_CHANCE')),
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

/**
 * Markets the contract still understands (legacy proxies emit them) but the
 * v1 product no longer exposes. The front silently filters them everywhere.
 * Mirrors the SUPPORTED_MARKET_TYPE_NAMES set in
 * `packages/domain/src/markets/DefaultMarkets.ts` — keep them in lockstep.
 */
export const HIDDEN_MARKETS: ReadonlySet<string> = new Set([
    MARKET_TYPE_HASHES.CORRECT_SCORE.toLowerCase(),
    MARKET_TYPE_HASHES.FIRST_SCORER.toLowerCase(),
    MARKET_TYPE_HASHES.GOALS_EXACT.toLowerCase(),
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
//   DOUBLE_CHANCE    : 0=No,    1=Yes    (line encodes variant: 0=1X, 1=12, 2=2X)
//   FIRST_SCORER     : 0=Home,  1=Away,  2=No goal (legacy, hidden in v1)
//
// CORRECT_SCORE / FIRST_SCORER / GOALS_EXACT are listed in HIDDEN_MARKETS and
// filtered everywhere on the front. The contract still understands them for
// legacy proxies deployed before the 8-market lineup.

const winnerOutcomes = (homeTeam?: string, awayTeam?: string): ReadonlyArray<MarketOutcome> => [
    { selection: 0, label: homeTeam ?? 'Home', hint: 'Home win' },
    { selection: 1, label: 'Draw', hint: 'Tie' },
    { selection: 2, label: awayTeam ?? 'Away', hint: 'Away win' },
];

export const FOOTBALL_MARKETS: Readonly<Record<string, MarketSpec>> = {
    [MARKET_TYPE_HASHES.WINNER.toLowerCase()]: {
        key: 'winner',
        label: "Match Result (90')",
        hint: 'Home / Draw / Away — regulation time only',
        hasLine: false,
        supportsBetting: true,
        getOutcomes: (_line, homeTeam, awayTeam) => winnerOutcomes(homeTeam, awayTeam),
    },
    // FULL_TIME_WINNER — knockout-only market (cups + league knockout phases).
    // Resolved on the AET aggregate or the penalty shootout winner. Binary
    // outcomes (Home / Away) because by construction the match reaches a
    // final winner: 30 min extra time, then PEN if still tied.
    // Backend seeding only attaches this market when `Match.isKnockout()` is
    // true (see KnockoutMatchPolicy in LOT 7) — for league matches it's
    // simply absent from the on-chain market list.
    [MARKET_TYPE_HASHES.FULL_TIME_WINNER.toLowerCase()]: {
        key: 'fulltimewinner',
        label: 'Final Winner (incl. AET + PEN)',
        hint: 'Includes extra time and penalty shootout',
        hasLine: false,
        supportsBetting: true,
        getOutcomes: (_line, homeTeam, awayTeam) => [
            { selection: 0, label: homeTeam ?? 'Home', hint: 'Home wins after AET / PEN' },
            { selection: 1, label: awayTeam ?? 'Away', hint: 'Away wins after AET / PEN' },
        ],
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
    // Double Chance — three separate markets (one per variant), each binary
    // No/Yes. The `line` field encodes the variant: 0=1X (Home or Draw),
    // 1=12 (Home or Away), 2=2X (Draw or Away). Each variant has its own
    // marketId and pool — bettors can take positions on multiple variants
    // (they're not mutually exclusive payoffs).
    [MARKET_TYPE_HASHES.DOUBLE_CHANCE.toLowerCase()]: {
        key: 'doublechance',
        label: 'Double Chance',
        hint: '1X / 12 / 2X',
        hasLine: true,
        supportsBetting: true,
        getOutcomes: (line, homeTeam, awayTeam) => {
            const variantText =
                line === 0 ? `${homeTeam ?? 'Home'} or Draw`
                : line === 1 ? `${homeTeam ?? 'Home'} or ${awayTeam ?? 'Away'}`
                : line === 2 ? `Draw or ${awayTeam ?? 'Away'}`
                : 'Double Chance';
            return [
                { selection: 0, label: `${variantText} — No`,  hint: 'Against this combo' },
                { selection: 1, label: `${variantText} — Yes`, hint: 'For this combo' },
            ];
        },
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
