export interface BanDto {
    id: string;
    status: 'active' | 'expired' | 'lifted_by_admin' | 'lifted_by_appeal';
    /** ISO 8601 */
    startsAt: string;
    /** ISO 8601 — null means permanent */
    expiresAt: string | null;
    escalationIndex: number;
}

/** GET /bans/me always answers 200 — `ban: null` when the caller is clean. */
export interface BanStatusResponseDto {
    ban: BanDto | null;
}
