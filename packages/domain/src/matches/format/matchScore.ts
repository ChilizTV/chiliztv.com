/**
 * Format helper for match scores — handles FT, AET, PEN and pre-match states.
 *
 * Wording convention (anglo-style, lowercase abbreviations):
 *   - FT    : "2 — 1"
 *   - AET   : "3 — 2 a.e.t."           (no parenthetical 90' breakdown)
 *   - PEN   : "5 — 4 pen (1 — 1)"      (parenthetical = AET aggregate before shootout)
 *   - none  : "—"                       (pre-kickoff, no score)
 *
 * For compact contexts (ticker, badges) callers should use `variant` + `primary`
 * and append "AET" / "PEN" as uppercase pill, omitting the parenthetical breakdown.
 *
 * Pure function — no React, no DOM, no I/O. Safe to test in isolation and to
 * call from both backend (e.g. notification bodies) and frontend.
 */

export type MatchScoreVariant = 'ft' | 'aet' | 'pen' | 'live' | 'none';

export interface MatchScoreInput {
    status: string;
    /** Final score as currently displayed (90' for FT, AET aggregate for AET/PEN). */
    score: { home: number; away: number } | null | undefined;
    /** Optional breakdown carrying the 90' / AET / PEN detail when relevant. */
    scoreBreakdown?: {
        ninety: { home: number; away: number };
        aet?: { home: number; away: number };
        pen?: { home: number; away: number };
    } | null;
}

export interface FormattedMatchScore {
    /** Score digits intended for the dominant typographic position (e.g. "5 — 4"). */
    primary: string;
    /** Optional caption rendered under or beside the primary (e.g. "pen (1 — 1)"). Null for FT / pre-match. */
    suffix: string | null;
    /** Discriminator for downstream styling and compact-ticker rendering. */
    variant: MatchScoreVariant;
}

const EM_DASH = '—'; // —

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE']);

function fmtPair(home: number, away: number): string {
    return `${home} ${EM_DASH} ${away}`;
}

export function fmtMatchScore(input: MatchScoreInput): FormattedMatchScore {
    const status = input.status;

    // Penalty shootout — show shootout score with the AET aggregate in parentheses.
    if (status === 'PEN') {
        const pen = input.scoreBreakdown?.pen;
        const aet = input.scoreBreakdown?.aet;
        if (pen) {
            const aetCaption = aet ? `pen (${fmtPair(aet.home, aet.away)})` : 'pen';
            return { primary: fmtPair(pen.home, pen.away), suffix: aetCaption, variant: 'pen' };
        }
        // Fallback: only the headline score is known (no breakdown).
        if (input.score) {
            return { primary: fmtPair(input.score.home, input.score.away), suffix: 'pen', variant: 'pen' };
        }
        return { primary: EM_DASH, suffix: null, variant: 'none' };
    }

    // Extra time — show AET aggregate with "a.e.t." suffix.
    if (status === 'AET') {
        const aet = input.scoreBreakdown?.aet;
        if (aet) {
            return { primary: fmtPair(aet.home, aet.away), suffix: 'a.e.t.', variant: 'aet' };
        }
        // Fallback when only the headline score is available — assumed AET aggregate.
        if (input.score) {
            return { primary: fmtPair(input.score.home, input.score.away), suffix: 'a.e.t.', variant: 'aet' };
        }
        return { primary: EM_DASH, suffix: null, variant: 'none' };
    }

    // Pre-match / no score at all.
    if (!input.score || input.score.home == null || input.score.away == null) {
        return { primary: EM_DASH, suffix: null, variant: 'none' };
    }

    // Live (in-game) — same shape as FT for the primary, distinct variant for styling.
    if (LIVE_STATUSES.has(status)) {
        return { primary: fmtPair(input.score.home, input.score.away), suffix: null, variant: 'live' };
    }

    // FT (or any other finished-but-non-AET/PEN status).
    return { primary: fmtPair(input.score.home, input.score.away), suffix: null, variant: 'ft' };
}
