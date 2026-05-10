import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { Prediction } from '@chiliztv/domain/predictions/entities/Prediction';
import { IPredictionRepository, UserPredictionStats } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';
import { TransactionHash } from '@chiliztv/domain/predictions/value-objects/TransactionHash';
import { Odds } from '@chiliztv/domain/predictions/value-objects/Odds';
import { PredictionStatus } from '@chiliztv/domain/predictions/value-objects/PredictionStatus';
import { logger } from '../../logging/logger';

interface PredictionRow {
  id: string;
  user_id: string;
  wallet_address: string;
  username: string;
  match_id: number;
  match_name: string;
  prediction_type: string;
  prediction_value: string;
  predicted_team: string;
  odds: number;
  status: PredictionStatus;
  actual_result?: string;
  transaction_hash: string;
  placed_at: string;
  match_start_time: string;
  settled_at?: string;
  created_at: string;
  updated_at: string;
}

@injectable()
export class SupabasePredictionRepository implements IPredictionRepository {
  async save(prediction: Prediction): Promise<Prediction> {
    const data = this.toRow(prediction);

    const { data: row, error } = await supabase
      .from('predictions')
      .insert(data)
      .select()
      .single();

    if (error) {
      logger.error('Failed to save prediction', { error: error.message });
      throw new Error('Failed to save prediction');
    }

    return this.toDomain(row);
  }

  async findById(id: string): Promise<Prediction | null> {
    const { data: row, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Failed to find prediction by id', { error: error.message, id });
      throw new Error('Failed to find prediction');
    }

    return row ? this.toDomain(row) : null;
  }

  async findByTransactionHash(transactionHash: TransactionHash): Promise<Prediction | null> {
    const { data: row, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('transaction_hash', transactionHash.getValue())
      .maybeSingle();

    if (error) {
      logger.error('Failed to find prediction by transaction hash', { error: error.message });
      throw new Error('Failed to find prediction');
    }

    return row ? this.toDomain(row) : null;
  }

  async findByUserId(userId: string, walletAddress: string, limit: number, offset: number): Promise<Prediction[]> {
    const { data: rows, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('wallet_address', walletAddress)
      .order('placed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Failed to find predictions by user', { error: error.message, userId });
      throw new Error('Failed to find predictions');
    }

    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findPendingForSettlement(): Promise<Prediction[]> {
    // NOTE: Removed match_start_time check to allow settlement of test matches
    // todo In production, the SettlePredictionsUseCase checks if match status is 'FT'
    const { data: rows, error } = await supabase
      .from('predictions')
      .select('*')
      .in('status', [PredictionStatus.PENDING, PredictionStatus.IN_PROGRESS]);

    if (error) {
      logger.error('Failed to find pending predictions', { error: error.message });
      throw new Error('Failed to find pending predictions');
    }

    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async getUserStats(userId: string, walletAddress: string): Promise<UserPredictionStats | null> {
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('status')
      .eq('user_id', userId)
      .eq('wallet_address', walletAddress);

    if (error) {
      logger.error('Failed to get user stats', { error: error.message, userId });
      throw new Error('Failed to get user stats');
    }

    if (!predictions || predictions.length === 0) {
      return null;
    }

    const totalPredictions = predictions.length;
    const totalWins = predictions.filter(p => p.status === PredictionStatus.WON).length;
    const totalLosses = predictions.filter(p => p.status === PredictionStatus.LOST).length;
    const activePredictions = predictions.filter(
      p => p.status === PredictionStatus.PENDING || p.status === PredictionStatus.IN_PROGRESS
    ).length;
    const winRate = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0;

    return {
      userId,
      walletAddress,
      totalPredictions,
      totalWins,
      totalLosses,
      activePredictions,
      winRate,
    };
  }

  async update(prediction: Prediction): Promise<Prediction> {
    const data = this.toRow(prediction);

    const { data: row, error } = await supabase
      .from('predictions')
      .update(data)
      .eq('id', prediction.getId())
      .select()
      .single();

    if (error) {
      logger.error('Failed to update prediction', { error: error.message, id: prediction.getId() });
      throw new Error('Failed to update prediction');
    }

    return this.toDomain(row);
  }

  private toDomain(row: PredictionRow): Prediction {
    return Prediction.reconstitute({
      id: row.id,
      userId: row.user_id,
      walletAddress: row.wallet_address,
      username: row.username,
      matchId: row.match_id,
      matchName: row.match_name,
      predictionType: row.prediction_type,
      predictionValue: row.prediction_value,
      predictedTeam: row.predicted_team,
      odds: Odds.create(row.odds),
      status: row.status,
      actualResult: row.actual_result,
      transactionHash: TransactionHash.create(row.transaction_hash),
      placedAt: new Date(row.placed_at),
      matchStartTime: new Date(row.match_start_time),
      settledAt: row.settled_at ? new Date(row.settled_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  /**
   * Distinct `match_id` (= `api_football_id`) values referenced by stored
   * predictions. Drives the match-retention policy: any match whose
   * `apiFootballId` is in this set must NOT be deleted by the 24h cleanup,
   * otherwise the prediction would orphan and lose its match context.
   *
   * Implementation note: dedup happens in JS — Supabase REST has no
   * `DISTINCT`. Acceptable up to ~50k rows; promote to a Postgres RPC
   * beyond that.
   */
  async listReferencedMatchIds(): Promise<ReadonlySet<number>> {
    const { data, error } = await supabase
      .from('predictions')
      .select('match_id')
      .not('match_id', 'is', null);

    if (error) {
      logger.error('Failed to list referenced match ids', { error: error.message });
      throw new Error('Failed to list referenced match ids');
    }

    const set = new Set<number>();
    for (const row of (data ?? []) as Array<{ match_id: number | null }>) {
      if (row.match_id != null) set.add(Number(row.match_id));
    }
    return set;
  }

  private toRow(prediction: Prediction): any {
    const json = prediction.toJSON();
    return {
      id: json.id,
      user_id: json.userId,
      wallet_address: json.walletAddress,
      username: json.username,
      match_id: json.matchId,
      match_name: json.matchName,
      prediction_type: json.predictionType,
      prediction_value: json.predictionValue,
      predicted_team: json.predictedTeam,
      odds: json.odds,
      status: json.status,
      actual_result: json.actualResult,
      transaction_hash: json.transactionHash,
      placed_at: json.placedAt.toISOString(),
      match_start_time: json.matchStartTime.toISOString(),
      settled_at: json.settledAt ? json.settledAt.toISOString() : null,
      created_at: json.createdAt.toISOString(),
      updated_at: json.updatedAt.toISOString(),
    };
  }
}
