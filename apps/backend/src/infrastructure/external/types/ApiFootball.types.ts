export interface ApiFootballMatch {
    fixture: {
        id: number;
        date: string;
        status: { short: string; elapsed: number | null };
        venue: { name: string };
    };
    teams: {
        home: { id: number; name: string; logo?: string };
        away: { id: number; name: string; logo?: string };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
    league: {
        name: string;
        season: number;
        id: number;
        country?: string;
        logo?: string;
        /**
         * Round label as emitted by API-Football /fixtures. Examples:
         * "Regular Season - 18", "Group Stage", "Round of 16 - 1st Leg",
         * "Quarter-finals", "Final", "Octavos de final".
         * Used by KnockoutMatchPolicy to detect knockout fixtures.
         */
        round?: string;
        /**
         * League type — NOT present on /fixtures payloads (lives on /leagues
         * endpoint only). Kept optional in the typed shape so a future cache
         * layer that joins league metadata can populate it without touching
         * the adapter. Today it's always undefined in raw fixture rows.
         */
        type?: string;
    };
    /**
     * Per-period score breakdown. Always present in the live `/fixtures`
     * payload; `halftime` becomes non-null once the match has reached HT.
     * The upstream sometimes clears these back to null during HT/post-FT
     * cleanups — callers MUST preserve the last known value (cf.
     * Match.setHalftimeScore, mirroring the elapsed_minutes pattern).
     *
     * `extratime` is populated when the fixture reaches ET/AET (sum of 90'
     * goals + extra-time goals — NOT a delta). `penalty` is populated when
     * the fixture reaches a penalty shootout (PEN), and reflects the
     * shootout result (not aggregate). Both are null for FT matches.
     */
    score?: {
        halftime?: { home: number | null; away: number | null };
        extratime?: { home: number | null; away: number | null };
        penalty?: { home: number | null; away: number | null };
    };
    referee: string;
}

export interface ApiFootballOdds {
    fixture: {
        id: number;
    };
    update: string;
    bookmakers: Array<{
        id: number;
        name: string;
        bets: Array<{
            id: number;
            name: string;
            values: Array<{
                value: string;
                odd: string;
            }>;
        }>;
    }>;
}

export interface ExtendedOdds {
    // Match Winner (1X2)
    match_winner?: {
        home: number;
        draw: number;
        away: number;
    };

    // Over/Under Goals
    over_under?: {
        over_0_5: number;
        over_1_5: number;
        over_2_5: number;
        over_3_5: number;
        over_4_5: number;
        under_0_5: number;
        under_1_5: number;
        under_2_5: number;
        under_3_5: number;
        under_4_5: number;
    };

    // Both Teams Score
    both_teams_score?: {
        yes: number;
        no: number;
    };

    // Double Chance
    double_chance?: {
        home_or_draw: number;
        home_or_away: number;
        draw_or_away: number;
    };

    // Draw No Bet
    draw_no_bet?: {
        home: number;
        away: number;
    };

    // First Half Winner
    first_half_winner?: {
        home: number;
        draw: number;
        away: number;
    };

    // First Half Goals
    first_half_goals?: {
        over_0_5: number;
        over_1_5: number;
        under_0_5: number;
        under_1_5: number;
    };

    // Half Time/Full Time
    ht_ft?: {
        home_home: number;
        home_draw: number;
        home_away: number;
        draw_home: number;
        draw_draw: number;
        draw_away: number;
        away_home: number;
        away_draw: number;
        away_away: number;
    };

    // Correct Score
    correct_score?: {
        [key: string]: number;
    };

    // Exact Goals Number
    exact_goals_number?: {
        [key: string]: number;
    };

    // Goalscorers (First Goalscorer)
    goalscorers?: {
        [playerName: string]: number;
    };

    // Clean Sheet
    clean_sheet?: {
        home_yes: number;
        home_no: number;
        away_yes: number;
        away_no: number;
    };

    // Win to Nil
    win_to_nil?: {
        home_yes: number;
        home_no: number;
        away_yes: number;
        away_no: number;
    };

    // Highest Scoring Half
    highest_scoring_half?: {
        first_half: number;
        second_half: number;
        equal: number;
    };

    // Odd/Even Goals
    odd_even_goals?: {
        odd: number;
        even: number;
    };

    // First Half Goals Odd/Even
    first_half_odd_even?: {
        odd: number;
        even: number;
    };
}

export interface MatchWithOdds {
    id: string;
    api_football_id: number;
    home_team: string;
    away_team: string;
    home_score: number | null;
    away_score: number | null;
    match_date: string;
    status: string;
    league: string;
    season: string;
    venue: string | null;
    referee: string | null;
    odds: ExtendedOdds | null;
    betting_contract_address?: string | null;
}
