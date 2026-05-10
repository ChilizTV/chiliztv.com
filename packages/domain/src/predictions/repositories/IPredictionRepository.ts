import { Prediction } from '../entities/Prediction';
import { TransactionHash } from '../value-objects/TransactionHash';

export interface UserPredictionStats {
  userId: string;
  walletAddress: string;
  totalPredictions: number;
  totalWins: number;
  totalLosses: number;
  activePredictions: number;
  winRate: number;
}

export interface IPredictionRepository {
  save(prediction: Prediction): Promise<Prediction>;
  findById(id: string): Promise<Prediction | null>;
  findByTransactionHash(transactionHash: TransactionHash): Promise<Prediction | null>;
  findByUserId(userId: string, walletAddress: string, limit: number, offset: number): Promise<Prediction[]>;
  findPendingForSettlement(): Promise<Prediction[]>;
  getUserStats(userId: string, walletAddress: string): Promise<UserPredictionStats | null>;
  update(prediction: Prediction): Promise<Prediction>;

  /**
   * Distinct `match_id` (= `api_football_id`) values referenced by stored
   * predictions. Used by the match-retention policy so the 24h cleanup
   * cannot orphan a prediction by deleting its match row.
   */
  listReferencedMatchIds(): Promise<ReadonlySet<number>>;
}
