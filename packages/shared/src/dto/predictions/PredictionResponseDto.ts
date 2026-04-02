import { PredictionStatus } from '@chiliztv/domain/predictions/value-objects/PredictionStatus';

export interface PredictionResponseDto {
  id: string;
  userId: string;
  walletAddress: string;
  username: string;
  matchId: number;
  matchName: string;
  /** Type de prédiction (ex: 'match_winner', 'over_under') */
  predictionType: string;
  /** Valeur prédite (ex: 'home', 'away', 'draw', 'over', 'under') */
  predictionValue: string;
  predictedTeam: string;
  odds: number;
  status: PredictionStatus;
  actualResult?: string;
  transactionHash: string;
  /** ISO 8601 — sérialisé depuis Date */
  placedAt: string;
  /** ISO 8601 — sérialisé depuis Date */
  matchStartTime: string;
  /** ISO 8601 — sérialisé depuis Date. Absent si non encore réglé. */
  settledAt?: string;
  /** ISO 8601 — sérialisé depuis Date */
  createdAt: string;
  /** ISO 8601 — sérialisé depuis Date */
  updatedAt: string;
}

export interface PredictionListResponseDto {
  predictions: PredictionResponseDto[];
  count: number;
}
