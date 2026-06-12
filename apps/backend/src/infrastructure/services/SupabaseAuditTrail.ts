import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../database/supabase/client';
import type { AuditEntry, IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';
import { logger } from '../logging/logger';

/** Append-only writer for audit_log. Failures are logged, never thrown —
 *  an audit hiccup must not roll back the admin action itself. */
@injectable()
export class SupabaseAuditTrail implements IAuditTrail {
    async record(entry: AuditEntry): Promise<void> {
        const { error } = await supabase.from('audit_log').insert({
            actor_wallet: entry.actorWallet.toLowerCase(),
            actor_role: entry.actorRole,
            action: entry.action,
            target_type: entry.targetType,
            target_id: entry.targetId,
            old_value: entry.oldValue ?? null,
            new_value: entry.newValue ?? null,
            ip: entry.ip ?? null,
            user_agent: entry.userAgent ?? null,
            request_id: entry.requestId ?? null,
        });
        if (error) {
            logger.error('audit_log write failed', { action: entry.action, error: error.message });
        }
    }
}
