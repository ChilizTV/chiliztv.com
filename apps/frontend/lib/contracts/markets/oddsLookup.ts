import type { MarketKey } from './types';
import type { MatchOdds } from '@/types/api.types';

/** Per-outcome decimal odds for one market. Indexed by selection (0/1/2). */
export interface MarketOdds {
    /** Map `selection` (the uint64 the contract receives) → decimal odds. */
    readonly bySelection: ReadonlyMap<number, number>;
    /** True when the admin has posted any odds for this market. */
    readonly hasAny: boolean;
}

const EMPTY: MarketOdds = { bySelection: new Map(), hasAny: false };

/**
 * Resolve the per-outcome odds for a given market from the match's DB JSONB.
 * Returns `EMPTY` (`hasAny=false`) when the admin hasn't posted odds — front
 * uses that flag to disable betting.
 *
 * Selection conventions:
 *   WINNER, HALFTIME : 0=Home, 1=Draw, 2=Away
 *   GOALS_TOTAL      : 0=Under, 1=Over
 *   BOTH_SCORE       : 0=No,    1=Yes
 *   FIRST_SCORER     : 0=Home,  1=Away, 2=None
 */
export function getOddsForMarket(odds: MatchOdds | undefined, key: MarketKey): MarketOdds {
    if (!odds) return EMPTY;
    switch (key) {
        case 'winner': {
            const w = odds.winner;
            if (!w) return EMPTY;
            return {
                bySelection: new Map([[0, w.homeWin], [1, w.draw], [2, w.awayWin]]),
                hasAny: true,
            };
        }
        case 'halftime': {
            const h = odds.halftime;
            if (!h) return EMPTY;
            return {
                bySelection: new Map([[0, h.homeWin], [1, h.draw], [2, h.awayWin]]),
                hasAny: true,
            };
        }
        case 'goalstotal': {
            const g = odds.goalsTotal;
            if (!g) return EMPTY;
            return {
                bySelection: new Map([[0, g.under], [1, g.over]]),
                hasAny: true,
            };
        }
        case 'bothscore': {
            const b = odds.bothScore;
            if (!b) return EMPTY;
            return {
                bySelection: new Map([[0, b.no], [1, b.yes]]),
                hasAny: true,
            };
        }
        case 'firstscorer': {
            const f = odds.firstScorer;
            if (!f) return EMPTY;
            return {
                bySelection: new Map([[0, f.home], [1, f.away], [2, f.none]]),
                hasAny: true,
            };
        }
        case 'goalsexact':
        case 'pointsexact':
        case 'bb-winner':
        case 'totalpoints':
        case 'spread':
            return EMPTY;
    }
}
