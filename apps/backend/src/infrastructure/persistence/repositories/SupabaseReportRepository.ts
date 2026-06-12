import { injectable } from 'tsyringe';

import { Report, type ReportProps, type ReportTargetType, type ReportStatus } from '@chiliztv/domain/reporting/entities/Report';
import type { AdminReportFilter, AdminReportPage, IReportRepository } from '@chiliztv/domain/reporting/repositories/IReportRepository';
import type { ReportSeverity } from '@chiliztv/domain/reporting/value-objects/QuorumSnapshot';

import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';

interface ReportRow {
  id: string;
  target_type: string;
  target_id: string;
  reporter_wallet: string;
  live_context_match_id: number | null;
  live_context_stream_id: string | null;
  reason_code: string;
  reason_free_text: string | null;
  severity: number;
  status: string;
  triggered_action_id: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by_wallet: string | null;
  review_note: string | null;
}

@injectable()
export class SupabaseReportRepository implements IReportRepository {
  async save(report: Report): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert(this.toRow(report))
      .select()
      .single();

    if (error) {
      logger.error('Failed to save report', { error: error.message, code: error.code });
      throw new Error('Failed to save report');
    }
    return this.toEntity(data as ReportRow);
  }

  async existsForReporter(
    reporterWallet: string,
    targetType: ReportTargetType,
    targetId: string,
    liveContextMatchId: number | null,
  ): Promise<boolean> {
    let query = supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('reporter_wallet', reporterWallet.toLowerCase())
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    query = liveContextMatchId === null
      ? query.is('live_context_match_id', null)
      : query.eq('live_context_match_id', liveContextMatchId);

    const { count, error } = await query;
    if (error) {
      logger.error('Failed to check report dedup', { error: error.message });
      throw new Error('Failed to check report dedup');
    }
    return (count ?? 0) > 0;
  }

  async findOpenOnTarget(
    targetType: ReportTargetType,
    targetId: string,
    liveContextMatchId: number | null,
  ): Promise<Report[]> {
    let query = supabase
      .from('reports')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('status', 'open');

    query = liveContextMatchId === null
      ? query.is('live_context_match_id', null)
      : query.eq('live_context_match_id', liveContextMatchId);

    const { data, error } = await query;
    if (error) {
      logger.error('Failed to load open reports', { error: error.message });
      throw new Error('Failed to load open reports');
    }
    return (data as ReportRow[]).map((row) => this.toEntity(row));
  }

  async markActionedBatch(reportIds: string[], actionId: string): Promise<void> {
    if (reportIds.length === 0) return;
    const { error } = await supabase
      .from('reports')
      .update({ status: 'auto_actioned', triggered_action_id: actionId })
      .in('id', reportIds)
      .eq('status', 'open');

    if (error) {
      logger.error('Failed to mark reports actioned', { error: error.message, actionId });
      throw new Error('Failed to mark reports actioned');
    }
  }

  async findForAdminQueue(filter: AdminReportFilter): Promise<AdminReportPage> {
    let query = supabase
      .from('reports')
      .select('*')
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(filter.limit + 1);
    if (filter.status) query = query.eq('status', filter.status);
    if (filter.severityMin) query = query.gte('severity', filter.severityMin);
    if (filter.targetType) query = query.eq('target_type', filter.targetType);
    if (filter.cursor) {
      const c = decodeCursor(filter.cursor);
      if (c) {
        query = query.or(
          `severity.lt.${c.s},and(severity.eq.${c.s},created_at.lt.${c.c}),and(severity.eq.${c.s},created_at.eq.${c.c},id.lt.${c.id})`,
        );
      }
    }
    const { data, error } = await query;
    if (error) {
      logger.error('Failed to list reports for admin', { error: error.message });
      throw new Error('Failed to list reports');
    }
    const rows = (data ?? []) as ReportRow[];
    const page = rows.slice(0, filter.limit);
    const last = page[page.length - 1];
    return {
      reports: page.map((row) => this.toEntity(row)),
      nextCursor: rows.length > filter.limit && last
        ? encodeCursor({ s: last.severity, c: last.created_at, id: last.id })
        : null,
    };
  }

  async findById(id: string): Promise<Report | null> {
    const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
    if (error) {
      logger.error('Failed to fetch report', { id, error: error.message });
      throw new Error('Failed to fetch report');
    }
    return data ? this.toEntity(data as ReportRow) : null;
  }

  async markReviewed(
    id: string,
    status: 'dismissed' | 'closed',
    reviewerWallet: string,
    note: string | null,
    at: Date,
  ): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .update({
        status,
        reviewed_at: at.toISOString(),
        reviewed_by_wallet: reviewerWallet.toLowerCase(),
        review_note: note,
      })
      .eq('id', id)
      .eq('status', 'open')
      .select();
    if (error) {
      logger.error('Failed to review report', { id, error: error.message });
      throw new Error('Failed to review report');
    }
    const rows = (data ?? []) as ReportRow[];
    return rows.length > 0 ? this.toEntity(rows[0]) : null;
  }

  private toRow(report: Report): Omit<ReportRow, 'created_at'> & { created_at: string } {
    const p = report.props;
    return {
      id: p.id,
      target_type: p.targetType,
      target_id: p.targetId,
      reporter_wallet: p.reporterWallet,
      live_context_match_id: p.liveContextMatchId,
      live_context_stream_id: p.liveContextStreamId,
      reason_code: p.reasonCode,
      reason_free_text: p.reasonFreeText,
      severity: p.severity,
      status: p.status,
      triggered_action_id: p.triggeredActionId,
      created_at: p.createdAt.toISOString(),
      reviewed_at: p.reviewedAt?.toISOString() ?? null,
      reviewed_by_wallet: p.reviewedByWallet,
      review_note: p.reviewNote,
    };
  }

  private toEntity(row: ReportRow): Report {
    const props: ReportProps = {
      id: row.id,
      targetType: row.target_type as ReportTargetType,
      targetId: row.target_id,
      reporterWallet: row.reporter_wallet,
      liveContextMatchId: row.live_context_match_id,
      liveContextStreamId: row.live_context_stream_id,
      reasonCode: row.reason_code,
      reasonFreeText: row.reason_free_text,
      severity: row.severity as ReportSeverity,
      status: row.status as ReportStatus,
      triggeredActionId: row.triggered_action_id,
      createdAt: new Date(row.created_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : null,
      reviewedByWallet: row.reviewed_by_wallet,
      reviewNote: row.review_note,
    };
    return Report.reconstitute(props);
  }
}

interface QueueCursor { s: number; c: string; id: string; }

function encodeCursor(c: QueueCursor): string {
  return Buffer.from(JSON.stringify(c)).toString('base64url');
}

function decodeCursor(raw: string): QueueCursor | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString());
    return typeof parsed?.s === 'number' && typeof parsed?.c === 'string' && typeof parsed?.id === 'string'
      ? parsed
      : null;
  } catch {
    return null;
  }
}
