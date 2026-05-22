import { injectable } from 'tsyringe';
import { PariMatchFactoryIndexer } from './indexers/PariMatchFactoryIndexer';
import { PariMatchEventIndexer } from './indexers/PariMatchEventIndexer';
import { ChilizSwapRouterIndexer } from './indexers/ChilizSwapRouterIndexer';
import { StreamWalletIndexer } from './indexers/StreamWalletIndexer';
import { LeaderboardIndexer } from './indexers/LeaderboardIndexer';
import { logger } from '../logging/logger';

/**
 * Lifecycle orchestrator for the blockchain event indexers.
 *
 *  - PariMatchFactory : MatchCreated discovery + post-deploy wiring validation
 *  - PariMatchEvent   : per-match PositionTaken / Claimed / Refunded / state
 *  - ChilizSwapRouter : multi-asset entrypoints (audit-only)
 *  - StreamWallet     : factory discovery + per-wallet donations / subs
 *  - Leaderboard      : WinRecorded / EpochClosed / PrizeClaimed / RolledOver
 *
 * Each indexer manages its own checkpoint and idempotent writes; they can be
 * restarted independently without producing duplicates.
 */
@injectable()
export class BlockchainEventListener {
    constructor(
        private readonly pariMatchFactoryIndexer: PariMatchFactoryIndexer,
        private readonly pariMatchEventIndexer: PariMatchEventIndexer,
        private readonly chilizSwapRouterIndexer: ChilizSwapRouterIndexer,
        private readonly streamWalletIndexer: StreamWalletIndexer,
        private readonly leaderboardIndexer: LeaderboardIndexer,
    ) {}

    async start(): Promise<void> {
        logger.info('Starting blockchain event listeners (5 indexers)');
        try {
            await Promise.all([
                this.pariMatchFactoryIndexer.start(),
                this.pariMatchEventIndexer.start(),
                this.chilizSwapRouterIndexer.start(),
                this.streamWalletIndexer.start(),
                this.leaderboardIndexer.start(),
            ]);
            logger.info('All blockchain event listeners started');
        } catch (error) {
            logger.error('Failed to start blockchain event listeners', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    stop(): void {
        logger.info('Stopping blockchain event listeners');
        this.pariMatchFactoryIndexer.stop();
        this.pariMatchEventIndexer.stop();
        this.chilizSwapRouterIndexer.stop();
        this.streamWalletIndexer.stop();
        this.leaderboardIndexer.stop();
        logger.info('All blockchain event listeners stopped');
    }
}
