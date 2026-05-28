// Live-only — every mock previously here (MOCK_TOP_10, POOL_SPLIT, STATS_CELLS,
// TICKER_ITEMS) was retired when the leaderboard switched to real backend data.
// The PreviewRow shape stays as the row contract between PreviewTable (which
// maps DTO entries into it) and PreviewRow (which renders it).

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
