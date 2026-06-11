export interface IPresenceService {
    /**
     * Distinct lowercase wallets present in the match room for at least
     * `minPresenceSec` and still active (last_activity within the liveness
     * window). Streamer/banned exclusion is the caller's concern.
     */
    getEligibleWallets(matchId: number, minPresenceSec: number, now: Date): Promise<string[]>;
}
