import { injectable } from 'tsyringe';

import type {
    AggregatePage,
    IAdminDirectoryRepository,
    MatchVolume,
    PlayerAggregate,
    StreamerAggregate,
} from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';

import { supabaseClient as supabase } from '../../database/supabase/client';
import { logger } from '../../logging/logger';

interface PlayerRow {
    wallet: string;
    bet_count: number;
    total_staked: string;
    total_payout: string;
    won_count: number;
    lost_count: number;
    pending_count: number;
    last_bet_at: string | null;
    total_count?: number;
}

interface StreamerRow {
    wallet: string;
    donation_count: number;
    donation_total: string;
    sub_count: number;
    sub_revenue: string;
    last_activity_at: string | null;
    total_count: number;
}

interface VolumeRow {
    contract_address: string;
    bet_count: number;
    total_staked: string;
}

function toPlayer(row: PlayerRow): PlayerAggregate {
    return {
        wallet: row.wallet,
        betCount: Number(row.bet_count),
        totalStaked: row.total_staked,
        totalPayout: row.total_payout,
        wonCount: Number(row.won_count),
        lostCount: Number(row.lost_count),
        pendingCount: Number(row.pending_count),
        lastBetAt: row.last_bet_at ? new Date(row.last_bet_at) : null,
    };
}

@injectable()
export class SupabaseAdminDirectoryRepository implements IAdminDirectoryRepository {
    async listPlayers(limit: number, offset: number): Promise<AggregatePage<PlayerAggregate>> {
        const { data, error } = await supabase.rpc('admin_player_aggregates', {
            p_limit: limit,
            p_offset: offset,
        });
        if (error) {
            logger.error('admin_player_aggregates failed', { error: error.message });
            throw new Error('Failed to list player aggregates');
        }
        const rows = (data ?? []) as PlayerRow[];
        return { items: rows.map(toPlayer), total: Number(rows[0]?.total_count ?? 0) };
    }

    async getPlayer(wallet: string): Promise<PlayerAggregate | null> {
        const { data, error } = await supabase.rpc('admin_player_summary', {
            p_wallet: wallet.toLowerCase(),
        });
        if (error) {
            logger.error('admin_player_summary failed', { wallet, error: error.message });
            throw new Error('Failed to read player aggregate');
        }
        const rows = (data ?? []) as PlayerRow[];
        return rows.length > 0 ? toPlayer(rows[0]) : null;
    }

    async listStreamers(limit: number, offset: number): Promise<AggregatePage<StreamerAggregate>> {
        const { data, error } = await supabase.rpc('admin_streamer_aggregates', {
            p_limit: limit,
            p_offset: offset,
        });
        if (error) {
            logger.error('admin_streamer_aggregates failed', { error: error.message });
            throw new Error('Failed to list streamer aggregates');
        }
        const rows = (data ?? []) as StreamerRow[];
        return {
            items: rows.map((row) => ({
                wallet: row.wallet,
                donationCount: Number(row.donation_count),
                donationTotal: row.donation_total,
                subCount: Number(row.sub_count),
                subRevenue: row.sub_revenue,
                lastActivityAt: row.last_activity_at ? new Date(row.last_activity_at) : null,
            })),
            total: Number(rows[0]?.total_count ?? 0),
        };
    }

    async matchVolumes(): Promise<ReadonlyMap<string, MatchVolume>> {
        const { data, error } = await supabase.rpc('admin_match_volumes');
        if (error) {
            logger.error('admin_match_volumes failed', { error: error.message });
            throw new Error('Failed to read match volumes');
        }
        const map = new Map<string, MatchVolume>();
        for (const row of (data ?? []) as VolumeRow[]) {
            map.set(row.contract_address.toLowerCase(), {
                contractAddress: row.contract_address.toLowerCase(),
                betCount: Number(row.bet_count),
                totalStaked: row.total_staked,
            });
        }
        return map;
    }
}
