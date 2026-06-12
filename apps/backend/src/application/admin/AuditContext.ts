/** Request-scoped identity every admin mutator stamps into audit_log. */
export interface AuditContext {
    readonly actorWallet: string;
    readonly actorRole: string;
    readonly ip?: string;
    readonly userAgent?: string;
    readonly requestId?: string;
}
