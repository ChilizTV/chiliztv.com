import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IAdminAccessService } from '@chiliztv/domain/admin/ports/IAdminAccessService';
import type { IAdminWalletRepository } from '@chiliztv/domain/admin/repositories/IAdminWalletRepository';
import { isAdminRole, type AdminRole } from '@chiliztv/domain/admin/types';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { ADMIN_ROLE_CACHE_TTL_SECONDS, adminRoleKey } from '../../shared/constants/admin.constants';

/** 'none' is cached too (negative caching) so non-admins don't hit the DB per request. */
const NONE = 'none';

@injectable()
export class CachedAdminAccessService implements IAdminAccessService {
    constructor(
        @inject(TOKENS.IAdminWalletRepository)
        private readonly adminWallets: IAdminWalletRepository,
        @inject(TOKENS.ICacheService)
        private readonly cache: ICacheService,
    ) {}

    async getActiveRole(walletAddress: string): Promise<AdminRole | null> {
        const key = adminRoleKey(walletAddress);
        const cached = await this.cache.get<string>(key);
        if (cached.hit) {
            return cached.value !== NONE && isAdminRole(cached.value) ? cached.value : null;
        }
        const role = await this.adminWallets.findActiveRole(walletAddress);
        await this.cache.set(key, role ?? NONE, ADMIN_ROLE_CACHE_TTL_SECONDS);
        return role;
    }

    async invalidate(walletAddress: string): Promise<void> {
        await this.cache.delete(adminRoleKey(walletAddress));
    }
}
