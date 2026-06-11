import { injectable } from 'tsyringe';

import { Ban, type BanProps, type BanStatus } from '@chiliztv/domain/reporting/entities/Ban';
import type { IBanRepository } from '@chiliztv/domain/reporting/repositories/IBanRepository';
import type { QuorumSnapshot } from '@chiliztv/domain/reporting/value-objects/QuorumSnapshot';
import { ConflictError } from '@chiliztv/domain/shared/errors/ConflictError';

import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';

const UNIQUE_VIOLATION = '23505';

interface BanRow {
  id: string;
  wallet_address: string;
  status: string;
  triggered_by_report_id: string | null;
  triggering_live_match_id: number | null;
  quorum_snapshot: QuorumSnapshot;
  starts_at: string;
  expires_at: string | null;
  ended_at: string | null;
  escalation_index: number;
  lifted_by_wallet: string | null;
  lift_note: string | null;
  created_at: string;
  updated_at: string;
}

@injectable()
export class SupabaseBanRepository implements IBanRepository {
  async save(ban: Ban): Promise<Ban> {
    const { data, error } = await supabase
      .from('bans')
      .insert(this.toRow(ban))
      .select()
      .single();

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        // idx_bans_one_active — a concurrent ban won the race.
        throw new ConflictError('An active ban already exists for this wallet', {
          walletAddress: ban.props.walletAddress,
        });
      }
      logger.error('Failed to save ban', { error: error.message, code: error.code });
      throw new Error('Failed to save ban');
    }
    return this.toEntity(data as BanRow);
  }

  async findActiveBan(walletAddress: string, now: Date): Promise<Ban | null> {
    // Time-derived enforcement: an expired-but-not-yet-flipped row is NOT a ban.
    const { data, error } = await supabase
      .from('bans')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`)
      .maybeSingle();

    if (error) {
      logger.error('Failed to load active ban', { error: error.message });
      throw new Error('Failed to load active ban');
    }
    return data ? this.toEntity(data as BanRow) : null;
  }

  async countEscalating(walletAddress: string): Promise<number> {
    // Admin-lifted bans are presumed wrongful and never escalate.
    const { count, error } = await supabase
      .from('bans')
      .select('id', { count: 'exact', head: true })
      .eq('wallet_address', walletAddress.toLowerCase())
      .in('status', ['active', 'expired']);

    if (error) {
      logger.error('Failed to count escalating bans', { error: error.message });
      throw new Error('Failed to count escalating bans');
    }
    return count ?? 0;
  }

  async findActiveWallets(wallets: string[], now: Date): Promise<string[]> {
    if (wallets.length === 0) return [];
    const { data, error } = await supabase
      .from('bans')
      .select('wallet_address')
      .in('wallet_address', wallets.map((w) => w.toLowerCase()))
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`);

    if (error) {
      logger.error('Failed to bulk-check banned wallets', { error: error.message });
      throw new Error('Failed to bulk-check banned wallets');
    }
    return Array.from(new Set((data as Array<{ wallet_address: string }>).map((r) => r.wallet_address)));
  }

  async findToExpire(now: Date, limit: number): Promise<Ban[]> {
    const { data, error } = await supabase
      .from('bans')
      .select('*')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lte('expires_at', now.toISOString())
      .limit(limit);

    if (error) {
      logger.error('Failed to load bans to expire', { error: error.message });
      throw new Error('Failed to load bans to expire');
    }
    return (data as BanRow[]).map((row) => this.toEntity(row));
  }

  async markExpired(banIds: string[], now: Date): Promise<void> {
    if (banIds.length === 0) return;
    const { error } = await supabase
      .from('bans')
      .update({ status: 'expired', ended_at: now.toISOString(), updated_at: now.toISOString() })
      .in('id', banIds)
      .eq('status', 'active');

    if (error) {
      logger.error('Failed to mark bans expired', { error: error.message });
      throw new Error('Failed to mark bans expired');
    }
  }

  private toRow(ban: Ban): Record<string, unknown> {
    const p = ban.props;
    return {
      id: p.id,
      wallet_address: p.walletAddress,
      status: p.status,
      triggered_by_report_id: p.triggeredByReportId,
      triggering_live_match_id: p.triggeringLiveMatchId,
      quorum_snapshot: p.quorumSnapshot,
      starts_at: p.startsAt.toISOString(),
      expires_at: p.expiresAt?.toISOString() ?? null,
      ended_at: p.endedAt?.toISOString() ?? null,
      escalation_index: p.escalationIndex,
      lifted_by_wallet: p.liftedByWallet,
      lift_note: p.liftNote,
    };
  }

  private toEntity(row: BanRow): Ban {
    const props: BanProps = {
      id: row.id,
      walletAddress: row.wallet_address,
      status: row.status as BanStatus,
      triggeredByReportId: row.triggered_by_report_id,
      triggeringLiveMatchId: row.triggering_live_match_id,
      quorumSnapshot: row.quorum_snapshot,
      startsAt: new Date(row.starts_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      endedAt: row.ended_at ? new Date(row.ended_at) : null,
      escalationIndex: row.escalation_index,
      liftedByWallet: row.lifted_by_wallet,
      liftNote: row.lift_note,
    };
    return Ban.reconstitute(props);
  }
}
