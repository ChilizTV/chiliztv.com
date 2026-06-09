import { describe, expect, it } from 'vitest';
import { fmtMatchScore } from '../matchScore';

describe('fmtMatchScore — FT path', () => {
    it('formats a regular FT score', () => {
        expect(fmtMatchScore({ status: 'FT', score: { home: 2, away: 1 } })).toEqual({
            primary: '2 — 1',
            suffix: null,
            variant: 'ft',
        });
    });
});

describe('fmtMatchScore — AET path', () => {
    it('uses the AET aggregate from scoreBreakdown when available', () => {
        // 1-1 at 90', 3-2 after extra time
        const result = fmtMatchScore({
            status: 'AET',
            score: { home: 3, away: 2 }, // aggregated final
            scoreBreakdown: {
                ninety: { home: 1, away: 1 },
                aet: { home: 3, away: 2 },
            },
        });
        expect(result).toEqual({ primary: '3 — 2', suffix: 'a.e.t.', variant: 'aet' });
    });

    it('falls back to the headline score when AET breakdown is missing', () => {
        const result = fmtMatchScore({
            status: 'AET',
            score: { home: 3, away: 2 },
        });
        expect(result).toEqual({ primary: '3 — 2', suffix: 'a.e.t.', variant: 'aet' });
    });

    it('returns the empty variant when both score and breakdown are absent', () => {
        const result = fmtMatchScore({ status: 'AET', score: null });
        expect(result).toEqual({ primary: '—', suffix: null, variant: 'none' });
    });
});

describe('fmtMatchScore — PEN path', () => {
    it('formats the shootout with the AET aggregate in parentheses', () => {
        // 1-1 at 90', 1-1 after AET, home won 5-4 on penalties
        const result = fmtMatchScore({
            status: 'PEN',
            score: { home: 1, away: 1 }, // physical goal aggregate (AET-level)
            scoreBreakdown: {
                ninety: { home: 1, away: 1 },
                aet: { home: 1, away: 1 },
                pen: { home: 5, away: 4 },
            },
        });
        expect(result).toEqual({
            primary: '5 — 4',
            suffix: 'pen (1 — 1)',
            variant: 'pen',
        });
    });

    it('omits the parenthetical when AET breakdown is absent but PEN is present', () => {
        const result = fmtMatchScore({
            status: 'PEN',
            score: { home: 1, away: 1 },
            scoreBreakdown: { ninety: { home: 1, away: 1 }, pen: { home: 5, away: 4 } },
        });
        expect(result).toEqual({ primary: '5 — 4', suffix: 'pen', variant: 'pen' });
    });

    it('falls back to the headline score with bare "pen" suffix when no breakdown', () => {
        const result = fmtMatchScore({
            status: 'PEN',
            score: { home: 1, away: 1 },
        });
        expect(result).toEqual({ primary: '1 — 1', suffix: 'pen', variant: 'pen' });
    });
});

describe('fmtMatchScore — live / pre-match paths', () => {
    it('returns "live" variant for in-game statuses with a score', () => {
        const result = fmtMatchScore({ status: '1H', score: { home: 0, away: 1 } });
        expect(result).toEqual({ primary: '0 — 1', suffix: null, variant: 'live' });
    });

    it('treats HT (halftime pause) as live', () => {
        const result = fmtMatchScore({ status: 'HT', score: { home: 1, away: 1 } });
        expect(result.variant).toBe('live');
    });

    it('returns "none" for pre-match NS without a score', () => {
        const result = fmtMatchScore({ status: 'NS', score: null });
        expect(result).toEqual({ primary: '—', suffix: null, variant: 'none' });
    });

    it('returns "none" when score has null home/away (defensive)', () => {
        const result = fmtMatchScore({
            status: 'FT',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            score: { home: null as any, away: null as any },
        });
        expect(result.variant).toBe('none');
    });
});

describe('fmtMatchScore — legacy compatibility', () => {
    it('handles undefined scoreBreakdown gracefully (pre-rollout payload)', () => {
        const result = fmtMatchScore({
            status: 'AET',
            score: { home: 2, away: 1 },
            scoreBreakdown: undefined,
        });
        expect(result.variant).toBe('aet');
        expect(result.primary).toBe('2 — 1');
    });
});
