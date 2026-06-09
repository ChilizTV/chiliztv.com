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
