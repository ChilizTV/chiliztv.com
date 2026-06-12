import { Request } from 'express';

import type { AuditContext } from '../../../application/admin/AuditContext';

/** Builds the audit context from a request that passed requireAdmin. */
export function auditCtx(req: Request): AuditContext {
    return {
        actorWallet: req.admin!.wallet,
        actorRole: req.admin!.role,
        ip: req.ip,
        userAgent: req.header('user-agent') ?? undefined,
        requestId: req.header('x-request-id') ?? undefined,
    };
}
