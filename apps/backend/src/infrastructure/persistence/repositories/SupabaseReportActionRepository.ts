import { injectable } from 'tsyringe';

import { ReportAction, type ReportActionProps, type ActionKind } from '@chiliztv/domain/reporting/entities/ReportAction';
import type { ReportTargetType } from '@chiliztv/domain/reporting/entities/Report';
import type { IReportActionRepository } from '@chiliztv/domain/reporting/repositories/IReportActionRepository';
import type { QuorumSnapshot } from '@chiliztv/domain/reporting/value-objects/QuorumSnapshot';

import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';

const UNIQUE_VIOLATION = '23505';

interface ReportActionRow {
  id: string;
  kind: string;
  target_type: string;
  target_id: string;
  live_context_match_id: number | null;
  quorum_snapshot: QuorumSnapshot;
  reporter_wallets: string[];
  triggered_at: string;
  reversed_at: string | null;
  reversed_by_wallet: string | null;
  reverse_note: string | null;
  affected_message_id: string | null;
  affected_stream_id: string | null;
  affected_ban_id: string | null;
}

@injectable()
export class SupabaseReportActionRepository implements IReportActionRepository {
  async save(action: ReportAction): Promise<ReportAction> {
    const { data, error } = await supabase
      .from('report_actions')
      .insert(this.toRow(action))
      .select()
      .single();

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        // idx_actions_one_active — concurrent double trigger after a lock
        // expiry. The action already exists: return it ("already done").
        const existing = await this.findActiveForTarget(
          action.props.targetType,
          action.props.targetId,
          action.props.liveContextMatchId,
        );
        if (existing) return existing;
      }
      logger.error('Failed to save report action', { error: error.message, code: error.code });
      throw new Error('Failed to save report action');
    }
    return this.toEntity(data as ReportActionRow);
  }

  async findActiveForTarget(
    targetType: ReportTargetType,
    targetId: string,
    liveContextMatchId: number | null,
  ): Promise<ReportAction | null> {
    let query = supabase
      .from('report_actions')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .is('reversed_at', null);

    query = liveContextMatchId === null
      ? query.is('live_context_match_id', null)
      : query.eq('live_context_match_id', liveContextMatchId);

    const { data, error } = await query.maybeSingle();
    if (error) {
      logger.error('Failed to load active action', { error: error.message });
      throw new Error('Failed to load active action');
    }
    return data ? this.toEntity(data as ReportActionRow) : null;
  }

  async findById(id: string): Promise<ReportAction | null> {
    const { data, error } = await supabase.from('report_actions').select('*').eq('id', id).maybeSingle();
    if (error) {
      logger.error('Failed to fetch report action', { id, error: error.message });
      throw new Error('Failed to fetch report action');
    }
    return data ? this.toEntity(data as ReportActionRow) : null;
  }

  async reverse(id: string, reversedByWallet: string, note: string | null, at: Date): Promise<ReportAction | null> {
    const { data, error } = await supabase
      .from('report_actions')
      .update({
        reversed_at: at.toISOString(),
        reversed_by_wallet: reversedByWallet.toLowerCase(),
        reverse_note: note,
      })
      .eq('id', id)
      .is('reversed_at', null)
      .select();
    if (error) {
      logger.error('Failed to reverse action', { id, error: error.message });
      throw new Error('Failed to reverse action');
    }
    const rows = (data ?? []) as ReportActionRow[];
    return rows.length > 0 ? this.toEntity(rows[0]) : null;
  }

  private toRow(action: ReportAction): Record<string, unknown> {
    const p = action.props;
    return {
      id: p.id,
      kind: p.kind,
      target_type: p.targetType,
      target_id: p.targetId,
      live_context_match_id: p.liveContextMatchId,
      quorum_snapshot: p.quorumSnapshot,
      reporter_wallets: p.reporterWallets,
      triggered_at: p.triggeredAt.toISOString(),
      reversed_at: p.reversedAt?.toISOString() ?? null,
      reversed_by_wallet: p.reversedByWallet,
      reverse_note: p.reverseNote,
      affected_message_id: p.affectedMessageId,
      affected_stream_id: p.affectedStreamId,
      affected_ban_id: p.affectedBanId,
    };
  }

  private toEntity(row: ReportActionRow): ReportAction {
    const props: ReportActionProps = {
      id: row.id,
      kind: row.kind as ActionKind,
      targetType: row.target_type as ReportTargetType,
      targetId: row.target_id,
      liveContextMatchId: row.live_context_match_id,
      quorumSnapshot: row.quorum_snapshot,
      reporterWallets: row.reporter_wallets,
      triggeredAt: new Date(row.triggered_at),
      reversedAt: row.reversed_at ? new Date(row.reversed_at) : null,
      reversedByWallet: row.reversed_by_wallet,
      reverseNote: row.reverse_note,
      affectedMessageId: row.affected_message_id,
      affectedStreamId: row.affected_stream_id,
      affectedBanId: row.affected_ban_id,
    };
    return ReportAction.reconstitute(props);
  }
}
