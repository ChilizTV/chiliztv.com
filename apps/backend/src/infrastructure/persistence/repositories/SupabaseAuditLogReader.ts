import { injectable } from 'tsyringe';

import type { AuditLogEntry, IAuditLogReader } from '@chiliztv/domain/admin/ports/IAuditLogReader';

import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';

interface AuditRow {
    id: number;
    action: string;
    target_type: string;
    target_id: string;
    actor_wallet: string;
    created_at: string;
}

@injectable()
export class SupabaseAuditLogReader implements IAuditLogReader {
    async findRecent(limit: number): Promise<AuditLogEntry[]> {
        const { data, error } = await supabase
            .from('audit_log')
            .select('id, action, target_type, target_id, actor_wallet, created_at')
            .order('id', { ascending: false })
            .limit(limit);
        if (error) {
            logger.error('Failed to read recent audit entries', { error: error.message });
            throw new Error('Failed to read recent audit entries');
        }
        return ((data ?? []) as AuditRow[]).map((row) => ({
            id: row.id,
            action: row.action,
            targetType: row.target_type,
            targetId: row.target_id,
            actorWallet: row.actor_wallet,
            createdAt: new Date(row.created_at),
        }));
    }
}
