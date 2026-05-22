import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';
import type { LeaderboardClaim } from '@chiliztv/domain/leaderboard/entities/LeaderboardClaim';
import type { ILeaderboardClaimRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardClaimRepository';

interface ClaimRow {
    epoch_id: string;
    user_address: string;
    amount: string;
    claimed_at: string;
    tx_hash: string;
}

function toDomain(row: ClaimRow): LeaderboardClaim {
    return {
        epochId: BigInt(row.epoch_id),
        userAddress: row.user_address,
        amount: BigInt(row.amount),
        claimedAt: new Date(row.claimed_at),
        txHash: row.tx_hash,
    };
}

@injectable()
export class SupabaseLeaderboardClaimRepository implements ILeaderboardClaimRepository {
    async insertIfAbsent(claim: LeaderboardClaim): Promise<boolean> {
        const { error } = await supabase.from('leaderboard_claims').insert({
            epoch_id: claim.epochId.toString(),
            user_address: claim.userAddress.toLowerCase(),
            amount: claim.amount.toString(),
            claimed_at: claim.claimedAt.toISOString(),
            tx_hash: claim.txHash.toLowerCase(),
        });
        if (error) {
            // 23505 = unique violation on (epoch_id, user_address) — idempotent reindex.
            if ((error as { code?: string }).code === '23505') return false;
            logger.error('Failed to insert claim', { error: error.message });
            throw new Error('Failed to insert claim');
        }
        return true;
    }

    async findByUser(userAddress: string): Promise<ReadonlyArray<LeaderboardClaim>> {
        const { data, error } = await supabase
            .from('leaderboard_claims')
            .select('*')
            .eq('user_address', userAddress.toLowerCase());
        if (error) {
            logger.error('Failed to fetch claims by user', { error: error.message });
            throw new Error('Failed to fetch claims by user');
        }
        return (data ?? []).map((row) => toDomain(row as ClaimRow));
    }

    async hasClaimed(epochId: bigint, userAddress: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('leaderboard_claims')
            .select('epoch_id')
            .eq('epoch_id', epochId.toString())
            .eq('user_address', userAddress.toLowerCase())
            .maybeSingle();
        if (error) {
            logger.error('Failed to check has-claimed', { error: error.message });
            throw new Error('Failed to check has-claimed');
        }
        return !!data;
    }
}
