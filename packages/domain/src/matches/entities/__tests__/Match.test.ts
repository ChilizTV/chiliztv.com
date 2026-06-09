import { describe, expect, it } from 'vitest';
import { Match, type MatchProps } from '../Match';

const baseProps: MatchProps = {
    id: 1,
    apiFootballId: 1001,
    homeTeamId: 1,
    homeTeamName: 'Home',
    awayTeamId: 2,
    awayTeamName: 'Away',
    leagueId: 100,
    leagueName: 'Test League',
    season: 2026,
    status: 'NS',
    matchDate: new Date('2026-06-10T20:00:00Z'),
    createdAt: new Date('2026-06-09T00:00:00Z'),
    updatedAt: new Date('2026-06-09T00:00:00Z'),
};

function makeMatch(overrides: Partial<MatchProps> = {}): Match {
    return Match.reconstitute({ ...baseProps, ...overrides });
}

describe('Match — finished states', () => {
    it('isFinished() is true for FT, AET, and PEN', () => {
        expect(makeMatch({ status: 'FT' }).isFinished()).toBe(true);
        expect(makeMatch({ status: 'AET' }).isFinished()).toBe(true);
        expect(makeMatch({ status: 'PEN' }).isFinished()).toBe(true);
    });

    it('isFinished() is false for live and upcoming statuses', () => {
        expect(makeMatch({ status: '1H' }).isFinished()).toBe(false);
        expect(makeMatch({ status: 'HT' }).isFinished()).toBe(false);
        expect(makeMatch({ status: '2H' }).isFinished()).toBe(false);
        expect(makeMatch({ status: 'ET' }).isFinished()).toBe(false);
        expect(makeMatch({ status: 'P' }).isFinished()).toBe(false);
        expect(makeMatch({ status: 'NS' }).isFinished()).toBe(false);
    });

    it('wentToExtraTime() is true for AET and PEN', () => {
        expect(makeMatch({ status: 'AET' }).wentToExtraTime()).toBe(true);
        expect(makeMatch({ status: 'PEN' }).wentToExtraTime()).toBe(true);
        expect(makeMatch({ status: 'FT' }).wentToExtraTime()).toBe(false);
    });

    it('wentToPenalties() is true only for PEN', () => {
        expect(makeMatch({ status: 'PEN' }).wentToPenalties()).toBe(true);
        expect(makeMatch({ status: 'AET' }).wentToPenalties()).toBe(false);
        expect(makeMatch({ status: 'FT' }).wentToPenalties()).toBe(false);
    });
});

describe('Match.getFinalScore()', () => {
    it('returns the 90\' score for FT matches', () => {
        const m = makeMatch({ status: 'FT', homeScore: 2, awayScore: 1 });
        expect(m.getFinalScore()).toEqual({ home: 2, away: 1 });
    });

    it('returns the AET aggregate (not the 90\' score) for AET matches', () => {
        // 1-1 at 90', 3-2 after extra time
        const m = makeMatch({
            status: 'AET',
            homeScore: 1, awayScore: 1,
            aetHomeScore: 3, aetAwayScore: 2,
        });
        expect(m.getFinalScore()).toEqual({ home: 3, away: 2 });
    });

    it('returns the AET aggregate for PEN matches (NOT the penalty shootout score)', () => {
        // 1-1 at 90', 1-1 after AET, home won 5-4 on penalties
        const m = makeMatch({
            status: 'PEN',
            homeScore: 1, awayScore: 1,
            aetHomeScore: 1, aetAwayScore: 1,
            penHomeScore: 5, penAwayScore: 4,
        });
        // getFinalScore reflects the physical goal count, not the shootout.
        expect(m.getFinalScore()).toEqual({ home: 1, away: 1 });
    });

    it('falls back to the 90\' score when AET fields are missing on an AET match (defensive)', () => {
        const m = makeMatch({
            status: 'AET',
            homeScore: 1, awayScore: 1,
            // aet* missing — defensive fallback to 90' score
        });
        expect(m.getFinalScore()).toEqual({ home: 1, away: 1 });
    });

    it('returns null for upcoming matches with no score', () => {
        const m = makeMatch({ status: 'NS' });
        expect(m.getFinalScore()).toBeNull();
    });
});

describe('Match.getPenaltyWinner()', () => {
    it('returns "home" when home won the shootout', () => {
        const m = makeMatch({
            status: 'PEN',
            homeScore: 1, awayScore: 1,
            aetHomeScore: 1, aetAwayScore: 1,
            penHomeScore: 5, penAwayScore: 4,
        });
        expect(m.getPenaltyWinner()).toBe('home');
    });

    it('returns "away" when away won the shootout', () => {
        const m = makeMatch({
            status: 'PEN',
            penHomeScore: 3, penAwayScore: 4,
        });
        expect(m.getPenaltyWinner()).toBe('away');
    });

    it('returns null for AET matches (no shootout)', () => {
        const m = makeMatch({
            status: 'AET',
            aetHomeScore: 3, aetAwayScore: 2,
        });
        expect(m.getPenaltyWinner()).toBeNull();
    });

    it('returns null when pen scores are missing on a PEN match (defensive)', () => {
        const m = makeMatch({ status: 'PEN' });
        expect(m.getPenaltyWinner()).toBeNull();
    });

    it('returns null on a tied pen score (degenerate)', () => {
        const m = makeMatch({
            status: 'PEN',
            penHomeScore: 5, penAwayScore: 5,
        });
        expect(m.getPenaltyWinner()).toBeNull();
    });
});

describe('Match.isKnockout()', () => {
    it('returns true when the prop is explicitly true', () => {
        expect(makeMatch({ isKnockout: true }).isKnockout()).toBe(true);
    });

    it('returns false when the prop is explicitly false', () => {
        expect(makeMatch({ isKnockout: false }).isKnockout()).toBe(false);
    });

    it('returns false when the prop is undefined (pre-migration row)', () => {
        expect(makeMatch({ isKnockout: undefined }).isKnockout()).toBe(false);
    });

    it('returns false when the prop is null (defensive against drift)', () => {
        // Cast through unknown — the prop is typed `boolean | undefined` but
        // a row coming from a permissive REST layer could surface null.
        expect(makeMatch({ isKnockout: null as unknown as undefined }).isKnockout()).toBe(false);
    });
});

describe('Match.setExtratimeScore / setPenaltyScore — monotone semantics', () => {
    it('setExtratimeScore persists both home and away when provided', () => {
        const m = makeMatch();
        expect(m.setExtratimeScore(3, 2)).toBe(true);
        expect(m.getAetHomeScore()).toBe(3);
        expect(m.getAetAwayScore()).toBe(2);
    });

    it('setExtratimeScore is no-op when either value is null/undefined', () => {
        const m = makeMatch({ aetHomeScore: 1, aetAwayScore: 1 });
        expect(m.setExtratimeScore(null, 2)).toBe(false);
        expect(m.setExtratimeScore(2, undefined)).toBe(false);
        // Last known values preserved
        expect(m.getAetHomeScore()).toBe(1);
        expect(m.getAetAwayScore()).toBe(1);
    });

    it('setExtratimeScore returns false when values are unchanged', () => {
        const m = makeMatch({ aetHomeScore: 3, aetAwayScore: 2 });
        expect(m.setExtratimeScore(3, 2)).toBe(false);
    });

    it('setPenaltyScore mirrors the same semantics', () => {
        const m = makeMatch();
        expect(m.setPenaltyScore(5, 4)).toBe(true);
        expect(m.setPenaltyScore(null, 5)).toBe(false);
        expect(m.getPenHomeScore()).toBe(5);
        expect(m.getPenAwayScore()).toBe(4);
    });
});

describe('Match.toJSON() — AET/PEN exposure', () => {
    it('exposes aet/pen scores, isKnockout, finalScore and penaltyWinner', () => {
        const m = makeMatch({
            status: 'PEN',
            homeScore: 1, awayScore: 1,
            aetHomeScore: 1, aetAwayScore: 1,
            penHomeScore: 5, penAwayScore: 4,
            isKnockout: true,
        });
        const json = m.toJSON();
        expect(json).toMatchObject({
            status: 'PEN',
            score: { home: 1, away: 1 },
            aetHomeScore: 1,
            aetAwayScore: 1,
            penHomeScore: 5,
            penAwayScore: 4,
            isKnockout: true,
            finalScore: { home: 1, away: 1 },
            penaltyWinner: 'home',
        });
    });

    it('defaults missing AET/PEN fields to null in JSON', () => {
        const m = makeMatch({ status: 'FT', homeScore: 2, awayScore: 0 });
        const json = m.toJSON();
        expect(json.aetHomeScore).toBeNull();
        expect(json.aetAwayScore).toBeNull();
        expect(json.penHomeScore).toBeNull();
        expect(json.penAwayScore).toBeNull();
        expect(json.isKnockout).toBe(false);
        expect(json.penaltyWinner).toBeNull();
        expect(json.finalScore).toEqual({ home: 2, away: 0 });
    });
});
