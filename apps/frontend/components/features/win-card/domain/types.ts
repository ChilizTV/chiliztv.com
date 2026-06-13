/** Win-card view model — pure data the WinCard component renders. Built from
 *  the user's WON bets on a single match by `buildWinCard`. */

export type WinCardFormat = 'story' | 'square';

export interface WinCardBet {
    /** Stable key `${contractAddress}:${marketId}:${outcome}`. */
    readonly id: string;
    /** Human label, e.g. "France · 90'" / "Over 2.5 goals · Goals". */
    readonly label: string;
    readonly stake: number;
    readonly payout: number;
    /** payout / stake for this single bet. */
    readonly mult: number;
}

export interface WinCardTeam {
    /** Derived 3-letter code (no code is stored upstream). */
    readonly code: string;
    readonly name: string;
    readonly logo: string | null;
}

export interface WinCardData {
    /** Match identity — also the localStorage "seen" key. */
    readonly matchId: number;
    readonly contractAddress: string;

    /** Aggregates across all winning bets on the match. */
    readonly stake: number;
    readonly payout: number;
    /** Aggregate multiplier = total payout / total stake. */
    readonly mult: number;

    readonly eyebrow: string;
    readonly stage: string;
    readonly home: WinCardTeam;
    readonly away: WinCardTeam;
    readonly score: string | null;

    /** Every winning bet, for the multi-bet list. Single-bet cards use bets[0]. */
    readonly bets: ReadonlyArray<WinCardBet>;

    /** Crowd flavour derived from the multiplier (no extra data). */
    readonly crowd: { readonly pre: string; readonly hi: string; readonly post: string };

    readonly pseudo: string;
    /** e.g. "#7 this week" — null when unranked. */
    readonly rank: string | null;
}
