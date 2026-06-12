/** Read side of the append-only audit_log — dashboard activity feed (admin+). */

export interface AuditLogEntry {
    readonly id: number;
    /** Namespaced action, e.g. 'moderation.ban.lift'. */
    readonly action: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly actorWallet: string;
    readonly createdAt: Date;
}

export interface IAuditLogReader {
    findRecent(limit: number): Promise<AuditLogEntry[]>;
}
