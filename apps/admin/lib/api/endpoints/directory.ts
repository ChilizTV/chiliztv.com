import { apiClient } from '../client';

export interface AdminPlayerDto {
  wallet: string;
  username: string | null;
  betCount: number;
  /** Raw USDC 6dp decimal string. */
  totalStaked: string;
  totalPayout: string;
  wonCount: number;
  lostCount: number;
  pendingCount: number;
  lastBetAt: string | null;
}

export interface AdminStreamerDto {
  wallet: string;
  donationCount: number;
  /** Human-readable CHZ decimal string (donations table stores formatted units). */
  donationTotal: string;
  subCount: number;
  subRevenue: string;
  lastActivityAt: string | null;
}

export interface AdminPlayerBetDto {
  contractAddress: string;
  marketId: string;
  outcome: string;
  stakeAmount: string;
  payoutAmount: string | null;
  status: 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';
  placedAt: string;
  claimedAt: string | null;
  match: {
    homeTeamName: string;
    awayTeamName: string;
    leagueName: string | null;
    matchDate: string;
    status: string;
  } | null;
  marketContext: { marketType: string; line: number | null } | null;
}

export interface AdminMatchSummaryDto {
  id: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamName: string;
  awayTeamLogo: string | null;
  leagueName: string;
  status: string;
  matchDate: string;
  elapsed: number | null;
  score: { home: number; away: number } | null;
  bettingContractAddress: string | null;
  betCount: number;
  totalStaked: string;
}

export interface AggregatePage<T> {
  items: T[];
  total: number;
}

export interface PageQuery {
  limit?: number;
  offset?: number;
}

function qs(params: object): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

export const directoryApi = {
  listPlayers: (query: PageQuery) =>
    apiClient.get<{ success: boolean; data: AggregatePage<AdminPlayerDto> }>(`/admin/players${qs(query)}`),
  getPlayer: (wallet: string) =>
    apiClient.get<{ success: boolean; data: { player: AdminPlayerDto; recentBets: AdminPlayerBetDto[] } }>(
      `/admin/players/${wallet}`,
    ),
  listStreamers: (query: PageQuery) =>
    apiClient.get<{ success: boolean; data: AggregatePage<AdminStreamerDto> }>(`/admin/streamers${qs(query)}`),
  listMatches: () =>
    apiClient.get<{ success: boolean; data: { items: AdminMatchSummaryDto[] } }>('/admin/matches'),

  deployContract: (matchId: number) =>
    apiClient.post<{ success: boolean; data: { contractAddress: string } }>(`/admin/matches/${matchId}/deploy`),
  closeMarkets: (matchId: number) =>
    apiClient.post<{ success: boolean; data: { closed: number; skipped: number } }>(
      `/admin/matches/${matchId}/close-markets`,
    ),
};
