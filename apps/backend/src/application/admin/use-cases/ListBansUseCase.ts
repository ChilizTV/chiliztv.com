import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { AdminBanFilter, AdminBanPage, IBanRepository } from '@chiliztv/domain/reporting/repositories/IBanRepository';

@injectable()
export class ListBansUseCase {
    constructor(
        @inject(TOKENS.IBanRepository) private readonly bans: IBanRepository,
    ) {}

    async execute(filter: AdminBanFilter): Promise<AdminBanPage> {
        return this.bans.listForAdmin({ ...filter, limit: Math.min(Math.max(filter.limit, 1), 100) });
    }
}
