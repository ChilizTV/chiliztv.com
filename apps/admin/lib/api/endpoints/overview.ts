import { apiClient } from '../client';
import type { AdminMatchSummaryDto } from './directory';

export interface OverviewActivityDto {
  action: string;
  targetType: string;
  targetId: string;
  actorWallet: string;
  at: string;
}

/** Counters are null when outside the caller's role scope (PO matrix). */
export interface AdminOverviewDto {
  openReports: { total: number; highSeverity: number } | null;
  activeBans: { total: number; permanent: number } | null;
  liveCount: number;
  liveNow: AdminMatchSummaryDto[];
  volume24h: string;
  nextKickoffAt: string | null;
  recentActivity: OverviewActivityDto[] | null;
}

export const overviewApi = {
  get: () => apiClient.get<{ success: boolean; data: AdminOverviewDto }>('/admin/overview'),
};
