import type { ReportConfig } from '../value-objects/ReportConfig';

export interface NextBanTerms {
    startsAt: Date;
    /** null = permanent. */
    expiresAt: Date | null;
    escalationIndex: number;
}

const HOUR_MS = 3_600_000;

/**
 * 0 prior ban → first duration; 1 → second duration; 2+ → permanent.
 * `escalatingCount` must only count bans with status active|expired —
 * admin-lifted bans are presumed wrongful and never escalate.
 */
export function nextBan(
    escalatingCount: number,
    config: Pick<ReportConfig, 'banFirstHours' | 'banSecondHours'>,
    now: Date,
): NextBanTerms {
    const escalationIndex = escalatingCount + 1;
    if (escalatingCount >= 2) {
        return { startsAt: now, expiresAt: null, escalationIndex };
    }
    const hours = escalatingCount === 0 ? config.banFirstHours : config.banSecondHours;
    return {
        startsAt: now,
        expiresAt: new Date(now.getTime() + hours * HOUR_MS),
        escalationIndex,
    };
}
