import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type {
    AggregatePage,
    IAdminDirectoryRepository,
    StreamerAggregate,
} from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';

const LISTING_TTL_SECONDS = 60;

@injectable()
export class ListStreamersUseCase {
    constructor(
        @inject(TOKENS.IAdminDirectoryRepository) private readonly directory: IAdminDirectoryRepository,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
    ) {}

    async execute(limit: number, offset: number): Promise<AggregatePage<StreamerAggregate>> {
        const page = await this.cache.getOrLoad<AggregatePage<StreamerAggregate>>({
            key: `admin:streamers:${limit}:${offset}`,
            ttlSeconds: LISTING_TTL_SECONDS,
            loader: () => this.directory.listStreamers(limit, offset),
        });
        return page ?? { items: [], total: 0 };
    }
}
