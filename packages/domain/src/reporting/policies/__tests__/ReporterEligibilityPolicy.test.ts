import { describe, it, expect } from 'vitest';

import { isEligible, type EligibilityInput } from '../ReporterEligibilityPolicy';

function input(overrides: Partial<EligibilityInput>): EligibilityInput {
    return {
        isPresent: false,
        hasEverBet: false,
        isStreamer: false,
        isBanned: false,
        isSelfReport: false,
        ...overrides,
    };
}

describe('isEligible', () => {
    it('accepts a present reporter', () => {
        expect(isEligible(input({ isPresent: true }))).toEqual({ ok: true });
    });

    it('accepts an absent reporter with betting history', () => {
        expect(isEligible(input({ hasEverBet: true }))).toEqual({ ok: true });
    });

    it('rejects when neither present nor bettor', () => {
        expect(isEligible(input({}))).toEqual({ ok: false, reason: 'not_eligible' });
    });

    it('rejects self-reports regardless of activity', () => {
        expect(isEligible(input({ isSelfReport: true, isPresent: true, hasEverBet: true })))
            .toEqual({ ok: false, reason: 'self_report' });
    });

    it('rejects the streamer regardless of activity', () => {
        expect(isEligible(input({ isStreamer: true, isPresent: true })))
            .toEqual({ ok: false, reason: 'streamer' });
    });

    it('rejects banned reporters regardless of activity', () => {
        expect(isEligible(input({ isBanned: true, hasEverBet: true })))
            .toEqual({ ok: false, reason: 'banned' });
    });

    it('identity rejections take precedence over the activity criterion', () => {
        // self_report > streamer > banned, all before not_eligible
        expect(isEligible(input({ isSelfReport: true, isStreamer: true, isBanned: true })))
            .toEqual({ ok: false, reason: 'self_report' });
        expect(isEligible(input({ isStreamer: true, isBanned: true })))
            .toEqual({ ok: false, reason: 'streamer' });
    });

    it('exhaustive truth table — ok iff no identity flag and (present or bettor)', () => {
        for (const isPresent of [true, false])
        for (const hasEverBet of [true, false])
        for (const isStreamer of [true, false])
        for (const isBanned of [true, false])
        for (const isSelfReport of [true, false]) {
            const result = isEligible({ isPresent, hasEverBet, isStreamer, isBanned, isSelfReport });
            const expectedOk = !isSelfReport && !isStreamer && !isBanned && (isPresent || hasEverBet);
            expect(result.ok).toBe(expectedOk);
        }
    });
});
