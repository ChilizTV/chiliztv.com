import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { ConflictError, NotFoundError } from '@chiliztv/domain/shared/errors';
import type { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { IAuditTrail } from '@chiliztv/domain/admin/ports/IAuditTrail';
import { Match } from '@chiliztv/domain/matches/entities/Match';

import { logger } from '../../../infrastructure/logging/logger';
import type { AuditContext } from '../AuditContext';
import { ADMIN_MATCHES_CACHE_KEY } from './ListAdminMatchesUseCase';

/**
 * Manual counterpart of the sync repair pass: deploys + seeds the betting
 * contract for a match that has none. Unlike the sync path, failures
 * propagate — the operator needs the actual revert reason.
 */
@injectable()
export class DeployMatchContractUseCase {
    constructor(
        @inject(TOKENS.IMatchRepository) private readonly matches: IMatchRepository,
        @inject(TOKENS.IBlockchainService) private readonly blockchain: IBlockchainService,
        @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
        @inject(TOKENS.IClock) private readonly clock: IClock,
        @inject(TOKENS.IAuditTrail) private readonly audit: IAuditTrail,
    ) {}

    async execute(matchId: number, ctx: AuditContext): Promise<{ contractAddress: string }> {
        const match = await this.matches.findById(matchId);
        if (!match) throw new NotFoundError('Match', String(matchId));

        const raw = match.toRaw();
        if (raw.bettingContractAddress) {
            throw new ConflictError(`Match already has a contract (${raw.bettingContractAddress})`);
        }
        if (match.isFinished()) {
            throw new ConflictError('Match is finished — deploying a contract is pointless');
        }

        const ownerAddress = this.blockchain.getAdminAddress();
        const { contractAddress } = await this.blockchain.deployBettingContract(
            `${raw.homeTeamName} vs ${raw.awayTeamName}`,
            ownerAddress,
        );
        await this.blockchain.setupDefaultMarkets(contractAddress, {
            isKnockout: raw.isKnockout === true,
        });
        await this.matches.update(
            Match.reconstitute({ ...raw, bettingContractAddress: contractAddress, updatedAt: this.clock.now() }),
        );
        await this.cache.delete(ADMIN_MATCHES_CACHE_KEY);

        logger.info('Admin manual contract deploy', { matchId, contractAddress, actor: ctx.actorWallet });
        await this.audit.record({
            ...ctx,
            action: 'markets.contract.deploy',
            targetType: 'match',
            targetId: String(matchId),
            newValue: { contractAddress },
        });
        return { contractAddress };
    }
}
