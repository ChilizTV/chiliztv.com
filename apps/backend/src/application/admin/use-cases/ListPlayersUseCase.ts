import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type {
    IAdminDirectoryRepository,
    PlayerAggregate,
} from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';
import type { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';

const LISTING_TTL_SECONDS = 60;

/** Aggregate enriched with the cached display profile (users table). */
export type PlayerDirectoryEntry = PlayerAggregate & { username: string | null };

export interface PlayerDirectoryPage {
    readonly items: PlayerDirectoryEntry[];
    readonly total: number;
}

@injectable()
export class ListPlayersUseCase {
    constructor(
        @inject(TOKENS.IAdminDirectoryRepository) private readonly directory: IAdminDirectoryRepository,
        @inject(TOKENS.IUserProfileRepository) private readonly profiles: IUserProfileRepository,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
    ) {}

    async execute(limit: number, offset: number): Promise<PlayerDirectoryPage> {
        const page = await this.cache.getOrLoad<PlayerDirectoryPage>({
            key: `admin:players:${limit}:${offset}`,
            ttlSeconds: LISTING_TTL_SECONDS,
            loader: () => this.load(limit, offset),
        });
        return page ?? { items: [], total: 0 };
    }

    private async load(limit: number, offset: number): Promise<PlayerDirectoryPage> {
        const page = await this.directory.listPlayers(limit, offset);
        const profiles = await this.profiles.findManyByWalletAddresses(page.items.map((p) => p.wallet));
        return {
            items: page.items.map((player) => ({
                ...player,
                username: profiles.get(player.wallet.toLowerCase())?.username ?? null,
            })),
            total: page.total,
        };
    }
}
