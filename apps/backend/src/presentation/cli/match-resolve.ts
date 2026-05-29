import { config } from 'dotenv';
import { resolve } from 'path';
// .env.local first so it overrides .env when present (local dev stack).
// dotenv defaults to "first wins"; missing files are ignored silently.
config({ path: resolve(__dirname, '../../../.env.local') });
config({ path: resolve(__dirname, '../../../.env') });
import 'reflect-metadata';

import { setupDependencyInjection, container } from '../../di/container';
setupDependencyInjection();

import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { IBlockchainService, FootballScoreInput } from '@chiliztv/domain/shared/ports/IBlockchainService';
import { logger } from '../../infrastructure/logging/logger';

/**
 * QA helper — forces resolution of a single match without waiting for the
 * `ResolveMarketsJob` cron tick.
 *
 *   pnpm match:resolve <matchId> <homeGoals> <awayGoals> [htHome] [htAway] [firstScorerId]
 *
 * Pulls the betting contract address from the `matches` row and calls
 * `resolveMarketsByScore` directly. Closes any still-Open market first
 * (the use case mirrors what the cron job does).
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error('Usage: pnpm match:resolve <matchId> <homeGoals> <awayGoals>');
        process.exit(1);
    }
    const matchId = Number(args[0]);
    const homeGoals = Number(args[1]);
    const awayGoals = Number(args[2]);

    if (!Number.isFinite(matchId) || !Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) {
        console.error('Invalid numeric arg — matchId / goals must be finite numbers');
        process.exit(1);
    }

    const matches = container.resolve<IMatchRepository>(TOKENS.IMatchRepository);
    const blockchain = container.resolve<IBlockchainService>(TOKENS.IBlockchainService);

    const match = await matches.findByApiFootballId(matchId);
    if (!match) {
        console.error(`Match ${matchId} not found in DB`);
        process.exit(1);
    }
    const contract = match.getBettingContractAddress();
    if (!contract) {
        console.error(`Match ${matchId} has no betting contract — cannot resolve on-chain`);
        process.exit(1);
    }

    const score: FootballScoreInput = {
        homeGoals,
        awayGoals,
    };

    logger.info('match:resolve — closing open markets first', {
        matchId,
        contract,
    });
    try {
        await blockchain.closeOpenMarketsForMatch(contract);
    } catch (err) {
        logger.warn('closeOpenMarketsForMatch failed (continuing anyway)', {
            error: err instanceof Error ? err.message : String(err),
        });
    }

    logger.info('match:resolve — resolving by score', {
        matchId,
        contract,
        score,
    });
    const resolvedCount = await blockchain.resolveMarketsByScore(
        contract,
        score,
    );
    logger.info(`match:resolve — done. ${resolvedCount} markets transitioned to Resolved`);
    process.exit(0);
}

main().catch((err) => {
    logger.error('match:resolve failed', {
        error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
});
