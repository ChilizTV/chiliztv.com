import { describe, it, expect } from 'vitest';

import { evaluateQuorum, type QuorumInput } from '../ReportQuorumPolicy';

const NOW = new Date('2026-06-11T12:00:00.000Z');
const CONFIG = { quorumPct: 25, floorCount: 5, bypassSeverityThreshold: 4 } as const;

function input(overrides: Partial<QuorumInput>): QuorumInput {
    return {
        distinctReports: 0,
        totalEligible: 20,
        maxSeverity: 2,
        config: CONFIG,
        now: NOW,
        ...overrides,
    };
}

describe('evaluateQuorum', () => {
    it('does not trigger below the floor even when the ratio is met', () => {
        // 10 eligible × 25% = 3, but floor is 5
        const d = evaluateQuorum(input({ distinctReports: 4, totalEligible: 10 }));
        expect(d.triggered).toBe(false);
    });

    it('triggers at the floor when the ratio threshold is lower', () => {
        const d = evaluateQuorum(input({ distinctReports: 5, totalEligible: 10 }));
        expect(d.triggered).toBe(true);
        if (d.triggered) {
            expect(d.snapshot.trigger).toBe('quorum');
            expect(d.snapshot.totalEligible).toBe(10);
            expect(d.snapshot.distinctReports).toBe(5);
            expect(d.snapshot.evaluatedAt).toBe(NOW.toISOString());
        }
    });

    it('uses the ratio when it exceeds the floor (ceil applied)', () => {
        // 30 eligible × 25% = 7.5 → ceil 8
        expect(evaluateQuorum(input({ distinctReports: 7, totalEligible: 30 })).triggered).toBe(false);
        expect(evaluateQuorum(input({ distinctReports: 8, totalEligible: 30 })).triggered).toBe(true);
    });

    it('falls back to the floor when nobody is eligible', () => {
        // ratio = 0 → threshold = floor
        expect(evaluateQuorum(input({ distinctReports: 4, totalEligible: 0 })).triggered).toBe(false);
        expect(evaluateQuorum(input({ distinctReports: 5, totalEligible: 0 })).triggered).toBe(true);
    });

    it('severity at the bypass threshold fires immediately with no denominator', () => {
        const d = evaluateQuorum(input({ distinctReports: 1, maxSeverity: 4 }));
        expect(d.triggered).toBe(true);
        if (d.triggered) {
            expect(d.snapshot.trigger).toBe('severity_bypass');
            expect(d.snapshot.totalEligible).toBeNull();
            expect(d.snapshot.distinctReports).toBe(1);
        }
    });

    it('severity 5 fires even with zero eligible users', () => {
        const d = evaluateQuorum(input({ distinctReports: 1, totalEligible: 0, maxSeverity: 5 }));
        expect(d.triggered).toBe(true);
    });

    it('severity just below the bypass threshold follows the quorum path', () => {
        const d = evaluateQuorum(input({ distinctReports: 1, maxSeverity: 3 }));
        expect(d.triggered).toBe(false);
    });

    it('respects a hot-reloaded config (floor 2, 50%)', () => {
        const config = { quorumPct: 50, floorCount: 2, bypassSeverityThreshold: 4 };
        // 8 eligible × 50% = 4 > floor 2
        expect(evaluateQuorum(input({ distinctReports: 3, totalEligible: 8, config })).triggered).toBe(false);
        expect(evaluateQuorum(input({ distinctReports: 4, totalEligible: 8, config })).triggered).toBe(true);
    });
});
