import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';
import type {
    EpochClosedPatch,
    LeaderboardEpoch,
    LeaderboardLeaf,
    NewLeaderboardEpochSeed,
} from '@chiliztv/domain/leaderboard/entities/LeaderboardEpoch';
import type { ILeaderboardEpochRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardEpochRepository';

interface EpochRow {
    tx_hash: string;
    epoch_id: string | null;
    merkle_root: string;
    prize_pool: string | null;
    claim_expiry: string | null;
    closed_at: string | null;
    rolled_over: string | null;
    rolled_over_at: string | null;
    leaves_json: Array<{ user: string; amount: string }>;
    status: 'pending' | 'confirmed' | 'rolled_over' | 'expired';
    created_at: string;
}

function toDomain(row: EpochRow): LeaderboardEpoch {
    return {
        txHash: row.tx_hash,
        epochId: row.epoch_id ? BigInt(row.epoch_id) : null,
        merkleRoot: row.merkle_root,
        prizePool: row.prize_pool ? BigInt(row.prize_pool) : null,
        claimExpiry: row.claim_expiry ? new Date(row.claim_expiry) : null,
        closedAt: row.closed_at ? new Date(row.closed_at) : null,
        rolledOver: row.rolled_over ? BigInt(row.rolled_over) : null,
        rolledOverAt: row.rolled_over_at ? new Date(row.rolled_over_at) : null,
        leaves: (row.leaves_json ?? []).map(
            (l): LeaderboardLeaf => ({
                userAddress: l.user,
                amount: BigInt(l.amount),
            }),
        ),
        status: row.status,
        createdAt: new Date(row.created_at),
    };
}

@injectable()
export class SupabaseLeaderboardEpochRepository implements ILeaderboardEpochRepository {
    async insertPending(seed: NewLeaderboardEpochSeed): Promise<void> {
        const { error } = await supabase
            .from('leaderboard_epochs')
            .insert({
                tx_hash: seed.txHash.toLowerCase(),
                merkle_root: seed.merkleRoot,
                leaves_json: seed.leaves.map((l) => ({
                    user: l.userAddress.toLowerCase(),
                    amount: l.amount.toString(),
                })),
                status: 'pending',
            });
        if (error) {
            logger.error('Failed to INSERT pending epoch', { error: error.message });
            throw new Error('Failed to INSERT pending epoch');
        }
    }

    async markConfirmed(patch: EpochClosedPatch): Promise<void> {
        const { error } = await supabase
            .from('leaderboard_epochs')
            .update({
                epoch_id: patch.epochId.toString(),
                prize_pool: patch.prizePool.toString(),
                claim_expiry: patch.claimExpiry.toISOString(),
                closed_at: patch.closedAt.toISOString(),
                status: 'confirmed',
            })
            .eq('tx_hash', patch.txHash.toLowerCase());
        if (error) {
            logger.error('Failed to mark epoch confirmed', { error: error.message });
            throw new Error('Failed to mark epoch confirmed');
        }
    }

    async markRolledOver(epochId: bigint, rolledOver: bigint, rolledOverAt: Date): Promise<void> {
        const { error } = await supabase
            .from('leaderboard_epochs')
            .update({
                rolled_over: rolledOver.toString(),
                rolled_over_at: rolledOverAt.toISOString(),
                status: 'rolled_over',
            })
            .eq('epoch_id', epochId.toString());
        if (error) {
            logger.error('Failed to mark epoch rolled over', { error: error.message });
            throw new Error('Failed to mark epoch rolled over');
        }
    }

    async findByEpochId(epochId: bigint): Promise<LeaderboardEpoch | null> {
        const { data, error } = await supabase
            .from('leaderboard_epochs')
            .select('*')
            .eq('epoch_id', epochId.toString())
            .eq('status', 'confirmed')
            .maybeSingle();
        if (error) {
            logger.error('Failed to fetch epoch', { error: error.message });
            throw new Error('Failed to fetch epoch');
        }
        return data ? toDomain(data as EpochRow) : null;
    }

    async findOpenClaimWindows(now: Date): Promise<ReadonlyArray<LeaderboardEpoch>> {
        const { data, error } = await supabase
            .from('leaderboard_epochs')
            .select('*')
            .eq('status', 'confirmed')
            .gt('claim_expiry', now.toISOString())
            .order('epoch_id', { ascending: false });
        if (error) {
            logger.error('Failed to fetch claimable epochs', { error: error.message });
            throw new Error('Failed to fetch claimable epochs');
        }
        return (data ?? []).map((row) => toDomain(row as EpochRow));
    }

    async findExpiredConfirmed(now: Date): Promise<ReadonlyArray<LeaderboardEpoch>> {
        const { data, error } = await supabase
            .from('leaderboard_epochs')
            .select('*')
            .eq('status', 'confirmed')
            .lt('claim_expiry', now.toISOString())
            .order('epoch_id', { ascending: true });
        if (error) {
            logger.error('Failed to fetch expired epochs', { error: error.message });
            throw new Error('Failed to fetch expired epochs');
        }
        return (data ?? []).map((row) => toDomain(row as EpochRow));
    }

    async findLatestConfirmedClosedAt(): Promise<Date | null> {
        const { data, error } = await supabase
            .from('leaderboard_epochs')
            .select('closed_at')
            .eq('status', 'confirmed')
            .order('closed_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            logger.error('Failed to fetch latest closed epoch', { error: error.message });
            throw new Error('Failed to fetch latest closed epoch');
        }
        const ts = (data as { closed_at: string | null } | null)?.closed_at;
        return ts ? new Date(ts) : null;
    }
}
