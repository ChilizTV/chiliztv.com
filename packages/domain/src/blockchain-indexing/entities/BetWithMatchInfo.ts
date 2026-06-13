import { Bet } from './Bet';

/**
 * Read model for the my-bets feed: a Bet enriched with the minimum match
 * metadata the UI needs to render a row (team names, league, kickoff).
 *
 * Lives alongside the Bet entity in the indexing context — it's owned by
 * the same aggregate, just shaped for the read side.
 */
export interface BetWithMatchInfo {
    readonly bet: Bet;
    readonly match: {
        readonly apiFootballId: number;
        readonly homeTeamName: string;
        readonly awayTeamName: string;
        readonly homeTeamLogo: string | null;
        readonly awayTeamLogo: string | null;
        readonly leagueName: string | null;
        readonly matchDate: Date;
        /** Final 90' score — null until the match is settled. Drives the win card. */
        readonly homeScore: number | null;
        readonly awayScore: number | null;
        /** API-Football status code (NS, 1H, HT, 2H, FT…) — lets the UI tell
         *  "match over, resolve in flight" apart from a plain pending bet. */
        readonly status: string;
    } | null;
    /**
     * Market context joined from the `MarketCreated` event indexed for
     * `(contract_address, market_id)`. Lets the front render
     * "Over 2.5 goals" instead of `Selection #1`. Null when the event
     * predates the indexer or the lookup fails.
     */
    readonly marketContext: {
        readonly marketType: string;
        readonly line: number | null;
    } | null;
}
