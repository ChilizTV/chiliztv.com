import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { NotFoundError } from '@chiliztv/domain/shared/errors';
import type {
    IAdminDirectoryRepository,
    PlayerAggregate,
} from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';
import type { IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import type { BetWithMatchInfo } from '@chiliztv/domain/blockchain-indexing/entities/BetWithMatchInfo';

const RECENT_BETS_LIMIT = 25;

export interface PlayerDetail {
    readonly player: PlayerAggregate;
    readonly recentBets: BetWithMatchInfo[];
}

@injectable()
export class GetPlayerDetailUseCase {
    constructor(
        @inject(TOKENS.IAdminDirectoryRepository) private readonly directory: IAdminDirectoryRepository,
        @inject(TOKENS.IBetRepository) private readonly bets: IBetRepository,
    ) {}

    async execute(wallet: string): Promise<PlayerDetail> {
        const normalized = wallet.toLowerCase();
        const player = await this.directory.getPlayer(normalized);
        if (!player) throw new NotFoundError('Player', normalized);

        const recentBets = await this.bets.findByUserWithMatchInfo(normalized, {
            limit: RECENT_BETS_LIMIT,
            offset: 0,
        });
        return { player, recentBets };
    }
}
