export interface WaitlistEntryResponseDto {
  id: string;
  email: string;
  walletAddress?: string;
  createdAt: string;
}

export interface WaitlistStatsResponseDto {
  totalEntries: number;
}
