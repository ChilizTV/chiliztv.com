/** Unified activity feed shape. Merged client-side by `useDashboardActivity`. */

export type ActivityType =
    | 'bet_placed'
    | 'bet_won'
    | 'bet_lost'
    | 'bet_refunded'
    | 'claim'
    | 'donation'
    | 'subscription'
    | 'lp_deposit'
    | 'lp_withdraw';

export interface ActivityRow {
    /** Stable id, e.g. `${source}:${tx_hash}:${log_index}`. */
    readonly id: string;
    /** Unix ms — sort + `timeAgo`. */
    readonly t: number;
    readonly type: ActivityType;
    readonly label: string;
    /** Signed USDC amount: negative for outflows, positive for inflows. */
    readonly amountUSDC: number;
    /** Short tx hash for the right column display. */
    readonly ref: string;
    /** Full tx hash — drives the explorer link. */
    readonly txHash?: string;
    /** Bet-only: surfaces the picked outcome on its own line with a tint. */
    readonly betPick?: BetPick;
}

/** A pari-mutuel pick rendered as a coloured chip under the activity label. */
export interface BetPick {
    readonly label: string;
    /** Hex / rgba — used for the chip color + tint background. */
    readonly tint: string;
}

/**
 * Tint per `(marketType, outcome)` for the bet pick chip. Uses palette
 * colors from CLAUDE.md §5 — green for "yes/over" answers, red shades for
 * "no/under/home", gold for draw, away in `#A50044` (matches the away
 * team crest in the bet dialog).
 */
export function tintForOutcome(marketType: string | null | undefined, outcome: string): string {
    const idx = Number(outcome);
    if (!marketType) return '#fff';
    switch (marketType) {
        case 'WINNER':
        case 'HALFTIME':
        case 'FIRST_SCORER':
            if (idx === 0) return '#E8001D';
            if (idx === 1) return marketType === 'FIRST_SCORER' ? '#A50044' : '#F5C518';
            if (idx === 2) return marketType === 'FIRST_SCORER' ? 'rgba(255,255,255,0.45)' : '#A50044';
            return '#fff';
        case 'GOALS_TOTAL':
        case 'BOTH_SCORE':
            // 0 = Under / No (red), 1 = Over / Yes (green)
            return idx === 1 ? '#2dd4a4' : '#FF1737';
        default:
            return '#fff';
    }
}

interface ActivityMeta {
    readonly label: string;
    readonly accent: string;
}

/** Per-type pill colors (locked design palette). */
export const ACTIVITY_META: Readonly<Record<ActivityType, ActivityMeta>> = {
    bet_placed:   { label: 'Predict',      accent: '#E8001D' },
    bet_won:      { label: 'Win',          accent: '#2dd4a4' },
    bet_lost:     { label: 'Loss',         accent: 'rgba(255,255,255,0.45)' },
    bet_refunded: { label: 'Refund',       accent: 'rgba(255,255,255,0.65)' },
    claim:        { label: 'Claim',        accent: '#2dd4a4' },
    donation:     { label: 'Donation',     accent: '#F5C518' },
    subscription: { label: 'Sub',          accent: '#F5C518' },
    lp_deposit:   { label: 'LP +',         accent: '#E8001D' },
    lp_withdraw:  { label: 'LP −',         accent: 'rgba(255,255,255,0.65)' },
};

export type ActivityFilterKey = 'all' | 'bets' | 'donate' | 'subs' | 'lp';

interface ActivityFilter {
    readonly key: ActivityFilterKey;
    readonly label: string;
    readonly types: ReadonlyArray<ActivityType> | null;
}

/** Filter chips. `types: null` means All. */
export const ACTIVITY_FILTERS: ReadonlyArray<ActivityFilter> = [
    { key: 'all',    label: 'All',           types: null },
    { key: 'bets',   label: 'Predictions',   types: ['bet_placed', 'bet_won', 'bet_lost', 'bet_refunded', 'claim'] },
    { key: 'donate', label: 'Donations',     types: ['donation'] },
    { key: 'subs',   label: 'Subscriptions', types: ['subscription'] },
    { key: 'lp',     label: 'LP',            types: ['lp_deposit', 'lp_withdraw'] },
];

export function applyActivityFilter(
    rows: ReadonlyArray<ActivityRow>,
    key: ActivityFilterKey,
): ReadonlyArray<ActivityRow> {
    const f = ACTIVITY_FILTERS.find((x) => x.key === key);
    if (!f || !f.types) return rows;
    const set = new Set(f.types);
    return rows.filter((r) => set.has(r.type));
}
