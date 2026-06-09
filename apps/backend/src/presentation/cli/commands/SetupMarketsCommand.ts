import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { PariMatchDeploymentAdapter } from '../../../infrastructure/blockchain/adapters/PariMatchDeploymentAdapter';
import { logger } from '../../../infrastructure/logging/logger';

/**
 * Setup Markets Command
 * Configures betting markets for contracts that exist but lack markets
 */
@injectable()
export class SetupMarketsCommand {
    constructor(
        @inject(TOKENS.IMatchRepository) private readonly matchRepository: IMatchRepository,
        @inject(PariMatchDeploymentAdapter) private readonly deploymentAdapter: PariMatchDeploymentAdapter
    ) {}

    async execute(): Promise<void> {
        try {
            logger.info('Searching for contracts without markets');

            // Get all matches with contracts
            const allMatches = await this.matchRepository.findAll();
            const matchesWithContract = allMatches.filter(m => !!m.getBettingContractAddress());

            if (matchesWithContract.length === 0) {
                logger.info('No matches with contracts found');
                return;
            }

            let setupCount = 0;
            let skippedCount = 0;
            let failedCount = 0;

            for (const match of matchesWithContract) {
                const matchJson = match.toJSON();
                const matchName = `${matchJson.homeTeam.name} vs ${matchJson.awayTeam.name}`;
                const contractAddress = match.getBettingContractAddress()!;

                logger.info('Processing match', { matchId: match.getId(), matchName, contractAddress });

                try {
                    // Check if markets exist
                    const count = await this.deploymentAdapter.getMarketCount(contractAddress);

                    if (count > 0) {
                        logger.info('Markets already configured, skipping', { count, matchId: match.getId() });
                        skippedCount++;
                        continue;
                    }

                    // Parimutuel — no odds parameter (pools emerge from stakes).
                    // Pass the knockout flag so the FULL_TIME_WINNER market is
                    // included (9 markets total) when the fixture is knockout.
                    await this.deploymentAdapter.setupDefaultMarkets(contractAddress, {
                        isKnockout: matchJson.isKnockout === true,
                    });

                    logger.info('Markets configured successfully', { matchId: match.getId() });
                    setupCount++;

                    // Pause between setups
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    logger.error('Error setting up markets', { error: errorMessage, matchId: match.getId() });
                    failedCount++;
                }
            }

            logger.info('Setup markets summary', {
                configured: setupCount,
                skipped: skippedCount,
                failed: failedCount
            });
        } catch (error) {
            logger.error('Setup markets command failed', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
}
