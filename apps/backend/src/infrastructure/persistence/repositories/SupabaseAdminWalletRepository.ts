import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import type { AdminGrant, IAdminWalletRepository } from '@chiliztv/domain/admin/repositories/IAdminWalletRepository';
import { isAdminRole, type AdminRole } from '@chiliztv/domain/admin/types';
import { logger } from '../../logging/logger';

@injectable()
export class SupabaseAdminWalletRepository implements IAdminWalletRepository {
    async findActiveRole(walletAddress: string): Promise<AdminRole | null> {
        const { data, error } = await supabase
            .from('admin_wallets')
            .select('role')
            .eq('wallet_address', walletAddress.toLowerCase())
            .is('revoked_at', null)
            .maybeSingle();
        if (error) {
            logger.error('findActiveRole failed', { walletAddress, error: error.message });
            throw new Error('Failed to read admin grant');
        }
        const role = (data as { role?: string } | null)?.role;
        return role && isAdminRole(role) ? role : null;
    }

    async grant(input: AdminGrant): Promise<void> {
        const { error } = await supabase.from('admin_wallets').insert({
            wallet_address: input.walletAddress.toLowerCase(),
            role: input.role,
            granted_by_wallet: input.grantedByWallet.toLowerCase(),
            note: input.note ?? null,
        });
        if (error) {
            logger.error('grant failed', { walletAddress: input.walletAddress, error: error.message });
            throw new Error(error.code === '23505' ? 'Wallet already has an active grant' : 'Failed to grant admin role');
        }
    }

    async revoke(walletAddress: string, revokedByWallet: string, note?: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('admin_wallets')
            .update({
                revoked_at: new Date().toISOString(),
                revoked_by_wallet: revokedByWallet.toLowerCase(),
                revoke_note: note ?? null,
            })
            .eq('wallet_address', walletAddress.toLowerCase())
            .is('revoked_at', null)
            .select('id');
        if (error) {
            logger.error('revoke failed', { walletAddress, error: error.message });
            throw new Error('Failed to revoke admin role');
        }
        return (data ?? []).length > 0;
    }
}
