export interface UserPredictionStatsResponseDto {
  userId: string;
  total: number;
  won: number;
  lost: number;
  pending: number;
  /** Ratio victoires/total, compris entre 0.0 et 1.0 */
  winRate: number;
}
