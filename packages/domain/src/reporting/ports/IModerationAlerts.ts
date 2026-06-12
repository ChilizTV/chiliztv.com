/**
 * Ops-channel alerts for ban lifecycle events (Discord #admin). Distinct from
 * IModerationNotifier, which targets the banned user in-app. Message
 * deletions are deliberately NOT alerted — too noisy for the channel.
 */

export interface BanIssuedAlert {
    readonly wallet: string;
    /** 'admin' when an operator banned manually, 'auto' for quorum/severity. */
    readonly source: 'auto' | 'admin';
    /** Set when source === 'admin'. */
    readonly adminWallet?: string;
    readonly trigger: 'quorum' | 'severity_bypass' | 'admin_manual';
    readonly reason?: string;
    readonly escalationIndex: number;
    /** null = permanent. */
    readonly expiresAt: Date | null;
}

export interface BanLiftedAlert {
    readonly wallet: string;
    /** 'admin' for a manual lift, 'expired' when the ban ran out. */
    readonly source: 'admin' | 'expired';
    readonly adminWallet?: string;
    readonly note?: string;
}

export interface IModerationAlerts {
    /** Implementations must never throw — alerting is best-effort. */
    banIssued(alert: BanIssuedAlert): Promise<void>;
    banLifted(alert: BanLiftedAlert): Promise<void>;
}
