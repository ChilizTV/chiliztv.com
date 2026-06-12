export interface AuditEntry {
    readonly actorWallet: string;
    readonly actorRole: string;
    /** Namespaced action, e.g. 'moderation.ban.lift'. */
    readonly action: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly oldValue?: unknown;
    readonly newValue?: unknown;
    readonly ip?: string;
    readonly userAgent?: string;
    readonly requestId?: string;
}

export interface IAuditTrail {
    record(entry: AuditEntry): Promise<void>;
}
