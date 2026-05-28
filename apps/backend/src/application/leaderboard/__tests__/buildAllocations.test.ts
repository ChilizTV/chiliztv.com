import { describe, expect, it } from 'vitest';
import { buildAllocations, type AllocationRow } from '../buildAllocations';

// Shared fixtures — mirrored by the frontend clone at
// apps/frontend/components/features/leaderboard/domain/buildAllocations.ts.
// If this test changes, the frontend module MUST be updated in lockstep.

const SCALE = 10n ** 18n;

function rows(...pairs: ReadonlyArray<readonly [string, bigint]>): AllocationRow[] {
    return pairs.map(([userAddress, totalScore]) => ({ userAddress, totalScore }));
}

describe('buildAllocations', () => {
    it('returns empty for empty input', () => {
        expect(buildAllocations([])).toEqual([]);
    });

    it('returns empty when total score is zero', () => {
        expect(buildAllocations(rows(['0xa', 0n], ['0xb', 0n]))).toEqual([]);
    });

    it('gives 100% of the scale to a single non-zero scorer', () => {
        expect(buildAllocations(rows(['0xa', 100n]))).toEqual([
            { user: '0xa', amount: SCALE },
        ]);
    });

    it('splits 600/400 into 60% / 40% of the scale', () => {
        const out = buildAllocations(rows(['0xa', 600n], ['0xb', 400n]));
        expect(out).toEqual([
            { user: '0xa', amount: (600n * SCALE) / 1000n },
            { user: '0xb', amount: (400n * SCALE) / 1000n },
        ]);
        // Sanity: 6e17 and 4e17 exactly (1000 divides 1e18 cleanly here).
        expect(out[0].amount).toBe(6n * 10n ** 17n);
        expect(out[1].amount).toBe(4n * 10n ** 17n);
    });

    it('distributes three equal scorers with floor rounding', () => {
        const out = buildAllocations(rows(['0xa', 100n], ['0xb', 100n], ['0xc', 100n]));
        const expected = SCALE / 3n;
        expect(out.every((a) => a.amount === expected)).toBe(true);
        // Floor rounding: total < SCALE by the remainder (1).
        const total = out.reduce((acc, a) => acc + a.amount, 0n);
        expect(SCALE - total).toBe(1n);
    });

    it('floors per-user when 7 equal scorers do not divide evenly', () => {
        const inputs = Array.from({ length: 7 }, (_, i) => [`0x${i}`, 1n] as const);
        const out = buildAllocations(rows(...inputs));
        const expected = SCALE / 7n;
        expect(out.length).toBe(7);
        expect(out.every((a) => a.amount === expected)).toBe(true);
        const total = out.reduce((acc, a) => acc + a.amount, 0n);
        // Sum strictly less than the notional pool due to integer division.
        expect(total).toBeLessThan(SCALE);
        expect(SCALE - total).toBeLessThan(7n);
    });
});
