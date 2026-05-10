/**
 * Leaderboard mock data.
 *
 * The leaderboard isn't live yet — every figure on the page is a teaser.
 * The lists below feed the preview table (top-10 sharp, 11-13 blurred to
 * suggest depth) and the prize-pool split. No currency amounts, no dates
 * — anything the contract hasn't decided is rendered as `TBA`.
 *
 * Once Cycle 0 ships, this module is the only place that needs to swap
 * from mock to a real API call (`fetchLeaderboardSnapshot()` etc.).
 */

import type { MedalKind } from './medals';

export interface PreviewRow {
    readonly rank: number;
    /** Truncated 0x address or .eth handle. */
    readonly who: string;
    readonly pnl: number;
    readonly win: number;
    readonly vol: number;
    readonly medal?: MedalKind;
}

export interface PoolSplitTier {
    readonly tier: string;
    readonly pct: number;
    readonly label: string;
    readonly medal: MedalKind;
    /** True when the tier splits across multiple winners (4–10th). */
    readonly per?: boolean;
    /** Number of winners when `per === true`. */
    readonly count?: number;
}

export interface StatCell {
    readonly label: string;
    readonly value: string;
    readonly sub: string;
}

/** Mock top 10 — illustrative ranking, no currency amounts. */
export const MOCK_TOP_10: ReadonlyArray<PreviewRow> = [
    { rank: 1,  who: '0xa4f…91d2',     pnl: 12480, win: 68, vol: 48000, medal: 'gold'   },
    { rank: 2,  who: 'degenfan.eth',   pnl:  8210, win: 62, vol: 32000, medal: 'silver' },
    { rank: 3,  who: '0xc01…7e0a',     pnl:  5506, win: 57, vol: 22000, medal: 'bronze' },
    { rank: 4,  who: 'psgmaxi.eth',    pnl:  3294, win: 54, vol: 18000 },
    { rank: 5,  who: '0x7d2…44ef',     pnl:  2640, win: 51, vol: 14000 },
    { rank: 6,  who: 'barcafan.eth',   pnl:  1980, win: 49, vol: 11000 },
    { rank: 7,  who: '0xb8c…12a3',     pnl:  1520, win: 47, vol:  9000 },
    { rank: 8,  who: 'juve_predictor', pnl:  1180, win: 46, vol:  8000 },
    { rank: 9,  who: '0x3f1…aa90',     pnl:   870, win: 44, vol:  7000 },
    { rank: 10, who: 'acm_legend.eth', pnl:   540, win: 42, vol:  6000 },
];

/** Three trailing rows rendered blurred to suggest a deeper list. */
export const MOCK_BLURRED_ROWS: ReadonlyArray<PreviewRow> = [
    { rank: 11, who: '0x91a…dd44',    pnl: 410, win: 41, vol: 5400 },
    { rank: 12, who: 'fcb_curva.eth', pnl: 320, win: 40, vol: 5100 },
    { rank: 13, who: '0xe22…b701',    pnl: 210, win: 39, vol: 4800 },
];

/** Pool-split tiers — percentage-only, locked. */
export const POOL_SPLIT: ReadonlyArray<PoolSplitTier> = [
    { tier: '1st',    pct: 40, label: 'Gold',   medal: 'gold'   },
    { tier: '2nd',    pct: 30, label: 'Silver', medal: 'silver' },
    { tier: '3rd',    pct: 20, label: 'Bronze', medal: 'bronze' },
    { tier: '4–10th', pct: 10, label: 'Top 10', medal: 'honor', per: true, count: 7 },
];

/** Stats strip cells under the hero. */
export const STATS_CELLS: ReadonlyArray<StatCell> = [
    { label: 'Prize pool',    value: 'TBA',          sub: '▲ Funded on-chain' },
    { label: 'Who gets paid', value: 'Top 10',       sub: 'Per cycle'         },
    { label: 'Cycle',         value: '30 days',      sub: 'Resets monthly'    },
    { label: 'On-chain',      value: 'Settled USDC', sub: 'Chiliz Chain'      },
];

/** Looping marquee items at the top of the page. */
export const TICKER_ITEMS: ReadonlyArray<string> = [
    'Coming soon',
    'Top 10 paid in USDC',
    'Monthly cycles',
    'On-chain payouts',
    'No claim required',
    'Bet to qualify',
    'Pool size · TBA',
];
