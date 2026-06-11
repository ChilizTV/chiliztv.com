export interface EligibilityInput {
    /** Presence ≥ min_presence_sec in the live context (wallet required). */
    isPresent: boolean;
    /** Has at least one historical off-chain bet row. */
    hasEverBet: boolean;
    isStreamer: boolean;
    isBanned: boolean;
    isSelfReport: boolean;
}

export type EligibilityResult =
    | { readonly ok: true }
    | { readonly ok: false; readonly reason: 'self_report' | 'streamer' | 'banned' | 'not_eligible' };

/**
 * A reporter must be present long enough OR have betting history, and must
 * not be the streamer, banned, or reporting themselves. Rejection order is
 * deliberate: identity rejections beat the activity criterion so the API
 * message is the most actionable one.
 */
export function isEligible(input: EligibilityInput): EligibilityResult {
    if (input.isSelfReport) return { ok: false, reason: 'self_report' };
    if (input.isStreamer) return { ok: false, reason: 'streamer' };
    if (input.isBanned) return { ok: false, reason: 'banned' };
    if (!input.isPresent && !input.hasEverBet) return { ok: false, reason: 'not_eligible' };
    return { ok: true };
}
