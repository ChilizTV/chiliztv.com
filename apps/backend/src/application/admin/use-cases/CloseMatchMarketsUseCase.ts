import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { ConflictError } from '@chiliztv/domain/shared/errors/ConflictError';
import { NotFoundError } from '@chiliztv/domain/shared/errors/NotFoundError';
import type { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { CloseMarketsResult, IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';

import { logger } from '../../../infrastructure/logging/logger';
import type { AuditContext } from '../AuditContext';
import { ADMIN_MATCHES_CACHE_KEY } from './ListAdminMatchesUseCase';

/** Closes every Open market on the match contract (idempotent batch tx). */
@injectable()
export class CloseMatchMarketsUseCase {
    constructor(
        @inject(TOKENS.IMatchRepository) private readonly matches: IMatchRepository,
        @inject(TOKENS.IBlockchainService) private readonly blockchain: IBlockchainService,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
        @inject(TOKENS.IAuditTrail) private readonly audit: IAuditTrail,
    ) {}

    async execute(matchId: number, ctx: AuditContext): Promise<CloseMarketsResult> {
        const match = await this.matches.findById(matchId);
        if (!match) throw new NotFoundError('Match', String(matchId));

        const contractAddress = match.toRaw().bettingContractAddress;
        if (!contractAddress) throw new ConflictError('Match has no deployed contract');

        const result = await this.blockchain.closeOpenMarketsForMatch(contractAddress);
        await this.cache.delete(ADMIN_MATCHES_CACHE_KEY);

        logger.info('Admin manual markets close', { matchId, contractAddress, ...result, actor: ctx.actorWallet });
        await this.audit.record({
            ...ctx,
            action: 'markets.markets.close',
            targetType: 'match',
            targetId: String(matchId),
            newValue: { contractAddress, closed: result.closed, skipped: result.skipped },
        });
        return result;
    }
}
