import { describe, expect, it } from 'vitest';
import { isKnockoutMatch } from '../KnockoutMatchPolicy';

describe('isKnockoutMatch — exclusions (over-trigger guards)', () => {
    it('returns false for Champions League Group Stage (League type, group round)', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Group Stage' } })).toBe(false);
    });

    it('returns false for World Cup Group Stage (Cup type with group round)', () => {
        expect(isKnockoutMatch({ league: { type: 'Cup', round: 'Group A' } })).toBe(false);
        expect(isKnockoutMatch({ league: { type: 'World', round: 'Group A' } })).toBe(false);
    });

    it('returns false for "Phase de Groupes" (French Group Stage label)', () => {
        expect(isKnockoutMatch({ league: { type: 'Cup', round: 'Phase de Groupes' } })).toBe(false);
    });

    it('returns false for Brasileirão-style "Grupo X"', () => {
        expect(isKnockoutMatch({ league: { type: 'Cup', round: 'Grupo C' } })).toBe(false);
    });

    it('returns false for the 1st leg of a 2-legged knockout tie (English)', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Round of 16 - 1st Leg' } })).toBe(false);
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Semi-finals - First Leg' } })).toBe(false);
    });

    it('returns false for the 1st leg in French ("Aller")', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Demi-finales - Aller' } })).toBe(false);
    });
});

describe('isKnockoutMatch — positive (knockout fixtures)', () => {
    it('returns true for the 2nd leg of a 2-legged knockout tie', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Round of 16 - 2nd Leg' } })).toBe(true);
    });

    it('returns true for the Final', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Final' } })).toBe(true);
    });

    it('returns true for any Cup match outside group/1st-leg exclusions', () => {
        // Random round label, even malformed — Cup type alone is enough.
        expect(isKnockoutMatch({ league: { type: 'Cup', round: '32e tour' } })).toBe(true);
        expect(isKnockoutMatch({ league: { type: 'Cup', round: 'unknown' } })).toBe(true);
    });

    it('returns true for Spanish knockout round labels (Octavos, Cuartos)', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Octavos de final' } })).toBe(true);
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Cuartos de final' } })).toBe(true);
    });

    it('returns true for French fraction-style rounds ("1/16 de finale")', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: '1/16 de finale' } })).toBe(true);
        expect(isKnockoutMatch({ league: { type: 'League', round: '1/8 de finale' } })).toBe(true);
    });

    it('returns true for "Play-off" rounds', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Play-off Round' } })).toBe(true);
    });
});

describe('isKnockoutMatch — negative (regular league rounds)', () => {
    it('returns false for Premier League Match Day 1', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Regular Season - 1' } })).toBe(false);
    });

    it('returns false for Ligue 1 round', () => {
        expect(isKnockoutMatch({ league: { type: 'League', round: 'Regular Season - 18' } })).toBe(false);
    });

    it('returns false when both league.type and round are absent (defensive)', () => {
        expect(isKnockoutMatch({ league: {} })).toBe(false);
    });
});

describe('isKnockoutMatch — primary signal via PURE_KNOCKOUT_LEAGUE_IDS', () => {
    it('returns true for Coupe de France (id=66) even with native French round label', () => {
        // Real-world payload: round localised in French, type missing → only
        // the league.id signal can resolve this correctly.
        expect(isKnockoutMatch({ league: { id: 66, round: '32e tour' } })).toBe(true);
    });

    it('returns true for FA Cup (id=45) regardless of round', () => {
        expect(isKnockoutMatch({ league: { id: 45, round: 'Third Round' } })).toBe(true);
    });

    it('returns true for Carabao Cup (id=48)', () => {
        expect(isKnockoutMatch({ league: { id: 48, round: 'Round 4' } })).toBe(true);
    });

    it('returns true for DFB-Pokal (id=81)', () => {
        expect(isKnockoutMatch({ league: { id: 81, round: '1. Runde' } })).toBe(true);
    });

    it('returns true for Copa do Brasil (id=73)', () => {
        expect(isKnockoutMatch({ league: { id: 73, round: 'Terceira Fase' } })).toBe(true);
    });

    it('returns true for UEFA Super Cup (id=531) Final', () => {
        expect(isKnockoutMatch({ league: { id: 531, round: 'Final' } })).toBe(true);
    });

    it('respects the 1st-leg exclusion even when leagueId is a super cup', () => {
        // Recopa is 2-legged (single fixture rounds in some seasons, two-legged
        // in others). The 1st leg never goes to AET — exclusion wins over the
        // PURE_KNOCKOUT_LEAGUE_IDS signal.
        expect(isKnockoutMatch({ league: { id: 541, round: 'Final - 1st Leg' } })).toBe(false);
    });

    it('returns true for Recopa Final (no leg suffix → assumed single)', () => {
        expect(isKnockoutMatch({ league: { id: 541, round: 'Final' } })).toBe(true);
    });

    it('returns false for Premier League (id=39) regardless of round label', () => {
        // 39 is NOT in PURE_KNOCKOUT_LEAGUE_IDS — League type with normal round.
        expect(isKnockoutMatch({ league: { id: 39, round: 'Regular Season - 1' } })).toBe(false);
    });

    it('respects the group-stage exclusion even when leagueId is a cup ID (defensive)', () => {
        // Hypothetical defensive case — should never happen with real
        // API-Football data (cups don't have group stages) but the policy
        // must stay deterministic.
        expect(isKnockoutMatch({ league: { id: 66, round: 'Group Stage' } })).toBe(false);
    });

    it('falls back to round regex when leagueId is unknown but round is a knockout label', () => {
        // CL Round of 16 (id=2 is NOT in PURE_KNOCKOUT — UCL has group + knockout)
        // — round regex catches it.
        expect(isKnockoutMatch({ league: { id: 2, round: 'Round of 16 - 2nd Leg' } })).toBe(true);
    });
});
