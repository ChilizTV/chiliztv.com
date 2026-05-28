import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';
import type {
    LeaderboardScore,
    LeaderboardScoreWithRank,
} from '@chiliztv/domain/leaderboard/entities/LeaderboardScore';
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';

interface ScoreRow {
    user_address: string;
    total_score: string;
    updated_at: string;
}

interface CycleScoreRow {
    user_address: string;
    score: string;
    updated_at: string;
}

function toDomain(row: ScoreRow): LeaderboardScore {
    return {
        userAddress: row.user_address,
        totalScore: BigInt(row.total_score),
        updatedAt: new Date(row.updated_at),
    };
}

function cycleRowToDomain(row: CycleScoreRow): LeaderboardScore {
    return {
        userAddress: row.user_address,
        totalScore: BigInt(row.score),
        updatedAt: new Date(row.updated_at),
    };
}

@injectable()
export class SupabaseLeaderboardScoreRepository implements ILeaderboardScoreRepository {
    async upsertScore(userAddress: string, delta: bigint): Promise<void> {
        const addr = userAddress.toLowerCase();
        // Atomic increment via Postgres RPC — `WinRecorded` events stream in
        // concurrently from the indexer so a read-modify-write would race.
        const { error } = await supabase.rpc('increment_leaderboard_score', {
            p_user_address: addr,
            p_delta: delta.toString(),
        });
        if (error) {
            logger.error('Failed to upsert leaderboard score', {
                userAddress: addr,
                error: error.message,
            });
            throw new Error('Failed to upsert leaderboard score');
        }
    }

    async getScoreForUser(userAddress: string): Promise<LeaderboardScore | null> {
        const { data, error } = await supabase
            .from('leaderboard_scores')
            .select('user_address, total_score, updated_at')
            .eq('user_address', userAddress.toLowerCase())
            .maybeSingle();
        if (error) {
            logger.error('Failed to read leaderboard score', { error: error.message });
            throw new Error('Failed to read leaderboard score');
        }
        return data ? toDomain(data as ScoreRow) : null;
    }

    async getRank(userAddress: string): Promise<number | null> {
        const { data, error } = await supabase.rpc('leaderboard_rank_of', {
            p_user_address: userAddress.toLowerCase(),
        });
        if (error) {
            logger.error('Failed to compute rank', { error: error.message });
            throw new Error('Failed to compute rank');
        }
        const rank = typeof data === 'number' ? data : Number(data);
        return Number.isFinite(rank) && rank > 0 ? rank : null;
    }

    async getTopN(limit: number): Promise<ReadonlyArray<LeaderboardScoreWithRank>> {
        const { data, error } = await supabase
            .from('leaderboard_scores')
            .select('user_address, total_score, updated_at')
            .order('total_score', { ascending: false })
            .limit(Math.max(1, Math.min(limit, 500)));
        if (error) {
            logger.error('Failed to read top scores', { error: error.message });
            throw new Error('Failed to read top scores');
        }
        return (data ?? []).map((row, idx) => ({
            ...toDomain(row as ScoreRow),
            rank: idx + 1,
        }));
    }

    async upsertCycleScore(cycleId: bigint, userAddress: string, delta: bigint): Promise<void> {
        const addr = userAddress.toLowerCase();
        const { error } = await supabase.rpc('increment_leaderboard_cycle_score', {
            p_cycle_id: cycleId.toString(),
            p_user_address: addr,
            p_delta: delta.toString(),
        });
        if (error) {
            logger.error('Failed to upsert cycle score', {
                cycleId: cycleId.toString(),
                userAddress: addr,
                error: error.message,
            });
            throw new Error('Failed to upsert cycle score');
        }
    }

    async getCycleScoreForUser(cycleId: bigint, userAddress: string): Promise<LeaderboardScore | null> {
        const { data, error } = await supabase
            .from('leaderboard_cycle_scores')
            .select('user_address, score, updated_at')
            .eq('cycle_id', cycleId.toString())
            .eq('user_address', userAddress.toLowerCase())
            .maybeSingle();
        if (error) {
            logger.error('Failed to read cycle score', { error: error.message });
            throw new Error('Failed to read cycle score');
        }
        return data ? cycleRowToDomain(data as CycleScoreRow) : null;
    }

    async getCycleRank(cycleId: bigint, userAddress: string): Promise<number | null> {
        const { data, error } = await supabase.rpc('leaderboard_cycle_rank_of', {
            p_cycle_id: cycleId.toString(),
            p_user_address: userAddress.toLowerCase(),
        });
        if (error) {
            logger.error('Failed to compute cycle rank', { error: error.message });
            throw new Error('Failed to compute cycle rank');
        }
        const rank = typeof data === 'number' ? data : Number(data);
        return Number.isFinite(rank) && rank > 0 ? rank : null;
    }

    async getTopNForCycle(cycleId: bigint, limit: number): Promise<ReadonlyArray<LeaderboardScoreWithRank>> {
        const { data, error } = await supabase
            .from('leaderboard_cycle_scores')
            .select('user_address, score, updated_at')
            .eq('cycle_id', cycleId.toString())
            .order('score', { ascending: false })
            .limit(Math.max(1, Math.min(limit, 500)));
        if (error) {
            logger.error('Failed to read cycle top scores', { error: error.message });
            throw new Error('Failed to read cycle top scores');
        }
        return (data ?? []).map((row, idx) => ({
            ...cycleRowToDomain(row as CycleScoreRow),
            rank: idx + 1,
        }));
    }
}
