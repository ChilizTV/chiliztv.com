import { apiClient } from '../client';

export type ReportStatus = 'open' | 'auto_actioned' | 'dismissed' | 'closed';
export type ReportTargetType = 'stream' | 'message' | 'account';
export type BanStatus = 'active' | 'expired' | 'lifted_by_admin' | 'lifted_by_appeal';
export type ActionKind = 'soft_delete_message' | 'stop_stream' | 'ban_account';

export interface AdminReportDto {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reporterWallet: string;
  liveContextMatchId: number | null;
  reasonCode: string;
  reasonFreeText: string | null;
  severity: 1 | 2 | 3 | 4 | 5;
  status: ReportStatus;
  triggeredActionId: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByWallet: string | null;
  reviewNote: string | null;
}

export interface AdminBanDto {
  id: string;
  walletAddress: string;
  status: BanStatus;
  quorumSnapshot: { trigger: string; issuedBy?: string; reason?: string };
  startsAt: string;
  expiresAt: string | null;
  endedAt: string | null;
  escalationIndex: number;
  liftedByWallet: string | null;
  liftNote: string | null;
}

export interface AdminActionDto {
  id: string;
  kind: ActionKind;
  targetType: ReportTargetType;
  targetId: string;
  quorumSnapshot: { trigger: string };
  triggeredAt: string;
  reversedAt: string | null;
  reversedByWallet: string | null;
  affectedMessageId: string | null;
  affectedStreamId: string | null;
  affectedBanId: string | null;
}

export interface ReportConfigDto {
  quorumPct: number;
  floorCount: number;
  minPresenceSec: number;
  banFirstHours: number;
  banSecondHours: number;
  bypassSeverityThreshold: number;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ReportsFilter {
  status?: ReportStatus;
  severityMin?: number;
  targetType?: ReportTargetType;
  cursor?: string | null;
}

function qs(params: object): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

export const moderationApi = {
  listReports: (filter: ReportsFilter) =>
    apiClient.get<{ success: boolean; data: Page<AdminReportDto> }>(`/admin/reports${qs(filter)}`),
  getReport: (id: string) =>
    apiClient.get<{ success: boolean; data: { report: AdminReportDto; triggeredAction: AdminActionDto | null } }>(
      `/admin/reports/${id}`,
    ),
  dismissReport: (id: string, note?: string) =>
    apiClient.post<{ success: boolean; data: AdminReportDto }>(`/admin/reports/${id}/dismiss`, { note }),
  closeReport: (id: string, note?: string) =>
    apiClient.post<{ success: boolean; data: AdminReportDto }>(`/admin/reports/${id}/close`, { note }),

  listBans: (filter: { status?: BanStatus; wallet?: string; cursor?: string | null }) =>
    apiClient.get<{ success: boolean; data: Page<AdminBanDto> }>(`/admin/bans${qs(filter)}`),
  /** durationHours: hours, null = permanent, undefined = escalation policy. */
  createBan: (walletAddress: string, reason: string, durationHours?: number | null) =>
    apiClient.post<{ success: boolean; data: AdminBanDto }>('/admin/bans', { walletAddress, reason, durationHours }),
  liftBan: (id: string, note: string) =>
    apiClient.post<{ success: boolean; data: AdminBanDto }>(`/admin/bans/${id}/lift`, { note }),

  reverseAction: (id: string, note?: string) =>
    apiClient.post<{ success: boolean; data: AdminActionDto }>(`/admin/actions/${id}/reverse`, { note }),

  getReportConfig: () =>
    apiClient.get<{ success: boolean; data: ReportConfigDto }>('/admin/report-config'),
  putReportConfig: (patch: Partial<ReportConfigDto>) =>
    apiClient.put<{ success: boolean; data: ReportConfigDto }>('/admin/report-config', patch),
};
