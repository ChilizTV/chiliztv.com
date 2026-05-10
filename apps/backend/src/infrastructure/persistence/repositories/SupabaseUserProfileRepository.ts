import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { UserProfile } from '@chiliztv/domain/users/entities/UserProfile';
import { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';
import { logger } from '../../logging/logger';

interface UserRow {
    wallet_address: string;
    username: string | null;
    avatar_url: string | null;
    updated_at: string;
}

function toDomain(row: UserRow): UserProfile {
    return UserProfile.create({
        walletAddress: row.wallet_address,
        username: row.username,
        avatarUrl: row.avatar_url,
        updatedAt: new Date(row.updated_at),
    });
}

@injectable()
export class SupabaseUserProfileRepository implements IUserProfileRepository {
    async findByWalletAddress(walletAddress: string): Promise<UserProfile | null> {
        const addr = walletAddress.toLowerCase();
        const { data, error } = await supabase
            .from('users')
            .select('wallet_address, username, avatar_url, updated_at')
            .eq('wallet_address', addr)
            .maybeSingle();
        if (error) {
            logger.error('Failed to load user profile', { addr, error: error.message });
            throw new Error('Failed to load user profile');
        }
        return data ? toDomain(data as UserRow) : null;
    }

    async findManyByWalletAddresses(
        walletAddresses: ReadonlyArray<string>,
    ): Promise<ReadonlyMap<string, UserProfile>> {
        const result = new Map<string, UserProfile>();
        if (walletAddresses.length === 0) return result;
        const addrs = Array.from(new Set(walletAddresses.map((a) => a.toLowerCase())));
        const { data, error } = await supabase
            .from('users')
            .select('wallet_address, username, avatar_url, updated_at')
            .in('wallet_address', addrs);
        if (error) {
            logger.error('Failed to batch-load user profiles', { count: addrs.length, error: error.message });
            throw new Error('Failed to batch-load user profiles');
        }
        for (const row of (data ?? []) as UserRow[]) {
            const profile = toDomain(row);
            result.set(profile.walletAddress, profile);
        }
        return result;
    }

    async upsert(profile: UserProfile): Promise<void> {
        const { error } = await supabase
            .from('users')
            .upsert(
                {
                    wallet_address: profile.walletAddress,
                    username: profile.username,
                    avatar_url: profile.avatarUrl,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'wallet_address' },
            );
        if (error) {
            logger.error('Failed to upsert user profile', {
                wallet: profile.walletAddress,
                error: error.message,
            });
            throw new Error('Failed to upsert user profile');
        }
    }
}
