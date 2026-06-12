import { inject, injectable } from 'tsyringe';

import type { IReportConfigProvider } from '@chiliztv/domain/reporting/ports/IReportConfigProvider';
import type { ReportConfig } from '@chiliztv/domain/reporting/value-objects/ReportConfig';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { TOKENS } from '@chiliztv/domain/shared/tokens';

import { supabaseClient as supabase } from '../database/supabase/client';
import { logger } from '../logging/logger';
import {
  REPORT_CONFIG_CACHE_KEY,
  REPORT_CONFIG_CACHE_TTL_SECONDS,
} from '../../shared/constants/moderation.constants';

interface ReportConfigRow {
  quorum_pct: number;
  floor_count: number;
  min_presence_sec: number;
  ban_first_hours: number;
  ban_second_hours: number;
  bypass_severity_threshold: number;
}

/** Sane fallback mirroring the migration defaults — used if the singleton row is unreadable. */
const DEFAULTS: ReportConfig = {
  quorumPct: 25,
  floorCount: 5,
  minPresenceSec: 120,
  banFirstHours: 24,
  banSecondHours: 168,
  bypassSeverityThreshold: 4,
};

/**
 * Hot-reloadable config: singleton DB row behind a short Redis TTL. Writers
 * (future admin panel) must DELETE `REPORT_CONFIG_CACHE_KEY` after UPDATE.
 */
@injectable()
export class ReportConfigCache implements IReportConfigProvider {
  constructor(
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async get(): Promise<ReportConfig> {
    const loaded = await this.cache.getOrLoad<ReportConfig>({
      key: REPORT_CONFIG_CACHE_KEY,
      ttlSeconds: REPORT_CONFIG_CACHE_TTL_SECONDS,
      loader: () => this.load(),
    });
    return loaded ?? DEFAULTS;
  }

  async update(patch: Partial<ReportConfig>): Promise<ReportConfig> {
    const row: Record<string, number> = {};
    if (patch.quorumPct !== undefined) row.quorum_pct = patch.quorumPct;
    if (patch.floorCount !== undefined) row.floor_count = patch.floorCount;
    if (patch.minPresenceSec !== undefined) row.min_presence_sec = patch.minPresenceSec;
    if (patch.banFirstHours !== undefined) row.ban_first_hours = patch.banFirstHours;
    if (patch.banSecondHours !== undefined) row.ban_second_hours = patch.banSecondHours;
    if (patch.bypassSeverityThreshold !== undefined) row.bypass_severity_threshold = patch.bypassSeverityThreshold;

    const { error } = await supabase.from('report_config').update(row).eq('id', 1);
    if (error) {
      logger.error('Failed to update report_config', { error: error.message });
      throw new Error('Failed to update report config');
    }
    // Hot reload: other instances re-read within the cache TTL (30s max).
    await this.cache.delete(REPORT_CONFIG_CACHE_KEY);
    const fresh = await this.load();
    return fresh ?? DEFAULTS;
  }

  private async load(): Promise<ReportConfig | null> {
    const { data, error } = await supabase
      .from('report_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      logger.error('Failed to load report_config — using defaults', { error: error?.message });
      return null;
    }
    const row = data as ReportConfigRow;
    return {
      quorumPct: row.quorum_pct,
      floorCount: row.floor_count,
      minPresenceSec: row.min_presence_sec,
      banFirstHours: row.ban_first_hours,
      banSecondHours: row.ban_second_hours,
      bypassSeverityThreshold: row.bypass_severity_threshold,
    };
  }
}
