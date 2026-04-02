export interface WaitlistEntryResponseDto {
  id: string;
  email: string;
  walletAddress?: string;
  hasAccess: boolean;
  position: number;
  /** ISO 8601 — sérialisé depuis Date */
  createdAt: string;
}

export interface CheckAccessResponseDto {
  hasAccess: boolean;
  email?: string;
  walletAddress?: string;
}

export interface WaitlistStatsResponseDto {
  total: number;
  granted: number;
  pending: number;
}
