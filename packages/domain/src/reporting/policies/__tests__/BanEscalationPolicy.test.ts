import { describe, it, expect } from 'vitest';

import { nextBan } from '../BanEscalationPolicy';

const NOW = new Date('2026-06-11T12:00:00.000Z');
const CONFIG = { banFirstHours: 24, banSecondHours: 168 } as const;

describe('nextBan', () => {
    it('first offence → 24h ban, escalation index 1', () => {
        const terms = nextBan(0, CONFIG, NOW);
        expect(terms.escalationIndex).toBe(1);
        expect(terms.startsAt).toEqual(NOW);
        expect(terms.expiresAt).toEqual(new Date('2026-06-12T12:00:00.000Z'));
    });

    it('second offence → 168h ban, escalation index 2', () => {
        const terms = nextBan(1, CONFIG, NOW);
        expect(terms.escalationIndex).toBe(2);
        expect(terms.expiresAt).toEqual(new Date('2026-06-18T12:00:00.000Z'));
    });

    it('third offence and beyond → permanent (expiresAt null)', () => {
        expect(nextBan(2, CONFIG, NOW).expiresAt).toBeNull();
        expect(nextBan(2, CONFIG, NOW).escalationIndex).toBe(3);
        expect(nextBan(7, CONFIG, NOW).expiresAt).toBeNull();
        expect(nextBan(7, CONFIG, NOW).escalationIndex).toBe(8);
    });

    it('reads durations from the hot-reloadable config', () => {
        const terms = nextBan(0, { banFirstHours: 1, banSecondHours: 2 }, NOW);
        expect(terms.expiresAt).toEqual(new Date('2026-06-11T13:00:00.000Z'));
    });
});
