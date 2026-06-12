import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { NotFoundError } from '@chiliztv/domain/shared/errors/NotFoundError';
import type { IAdminDirectoryRepository } from '@chiliztv/domain/admin/repositories/IAdminDirectoryRepository';
import type { IBetRepository } from '@chiliztv/domain/blockchain-indexing/repositories/IBetRepository';
import type { BetWithMatchInfo } from '@chiliztv/domain/blockchain-indexing/entities/BetWithMatchInfo';
import type { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';

import type { PlayerDirectoryEntry } from './ListPlayersUseCase';

const RECENT_BETS_LIMIT = 25;

export interface PlayerDetail {
    readonly player: PlayerDirectoryEntry;
    readonly recentBets: BetWithMatchInfo[];
}

@injectable()
export class GetPlayerDetailUseCase {
    constructor(
        @inject(TOKENS.IAdminDirectoryRepository) private readonly directory: IAdminDirectoryRepository,
        @inject(TOKENS.IBetRepository) private readonly bets: IBetRepository,
        @inject(TOKENS.IUserProfileRepository) private readonly profiles: IUserProfileRepository,
    ) {}

    async execute(wallet: string): Promise<PlayerDetail> {
        const normalized = wallet.toLowerCase();
        const player = await this.directory.getPlayer(normalized);
        if (!player) throw new NotFoundError('Player', normalized);

        const [profile, recentBets] = await Promise.all([
            this.profiles.findByWalletAddress(normalized),
            this.bets.findByUserWithMatchInfo(normalized, { limit: RECENT_BETS_LIMIT, offset: 0 }),
        ]);
        return { player: { ...player, username: profile?.username ?? null }, recentBets };
    }
}
