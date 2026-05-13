import { inject, injectable } from 'tsyringe';
import { container } from '../../config/di-container';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { StreamLifecycleService } from '../../services/StreamLifecycleService';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { logger } from '../../logging/logger';

/**
 * Stale Stream Cleanup Job
 * Runs every 3 minutes. Two passes:
 *  - LIVE browser streams with `last_heartbeat_at` > 5 min → end. OBS rows
 *    are excluded — their lifecycle is driven by provider webhooks (Cloudflare Stream).
 *  - CREATED orphans > 15 min → end. Covers setup placeholders abandoned
 *    before the publisher ever connected.
 */
@injectable()
export class StaleStreamCleanupJob {
  private readonly schedule = '*/3 * * * *'; // Every 3 minutes

  constructor(
    @inject(TOKENS.IClock) private readonly clock: IClock,
  ) {}

  getSchedule(): string {
    return this.schedule;
  }

  async execute(): Promise<void> {
    try {
      const lifecycleService = container.resolve(StreamLifecycleService);
      const streamRepository = container.resolve<IStreamRepository>(TOKENS.IStreamRepository);

      const now = this.clock.now();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      const [staleLive, staleCreated] = await Promise.all([
        streamRepository.findStaleLiveStreams(fiveMinutesAgo),
        streamRepository.findStaleCreatedStreams(fifteenMinutesAgo),
      ]);

      for (const stream of staleLive) {
        await lifecycleService.endStaleLive(stream.getStreamKey());
        logger.warn('Stale LIVE stream auto-ended by cron', { streamKey: stream.getStreamKey() });
      }

      for (const stream of staleCreated) {
        await lifecycleService.endStaleCreated(stream.getStreamKey());
        logger.warn('Orphan CREATED stream auto-ended by cron', { streamKey: stream.getStreamKey() });
      }

      if (staleLive.length > 0 || staleCreated.length > 0) {
        logger.info('Stale stream cleanup completed', {
          endedLive: staleLive.length,
          endedCreated: staleCreated.length,
        });
      }
    } catch (error) {
      logger.error('Stale stream cleanup job failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
