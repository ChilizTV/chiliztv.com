import { inject, injectable } from 'tsyringe';
import { container } from '../../config/di-container';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { logger } from '../../logging/logger';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Daily DELETE for ENDED streams older than 7 days. Idempotent — rejouable
 * sans effet de bord. Audit consumers via `D7` before extending retention.
 */
@injectable()
export class OldEndedStreamsCleanupJob {
  private readonly schedule = '0 3 * * *'; // 3am daily

  constructor(
    @inject(TOKENS.IClock) private readonly clock: IClock,
  ) {}

  getSchedule(): string {
    return this.schedule;
  }

  async execute(): Promise<void> {
    try {
      const streamRepository = container.resolve<IStreamRepository>(TOKENS.IStreamRepository);
      const cutoff = new Date(this.clock.now().getTime() - SEVEN_DAYS_MS);
      const oldStreams = await streamRepository.findOldEndedStreams(cutoff);
      if (oldStreams.length === 0) return;

      for (const stream of oldStreams) {
        await streamRepository.delete(stream.getId());
      }
      logger.info('Old ENDED streams cleanup completed', { count: oldStreams.length, cutoff: cutoff.toISOString() });
    } catch (error) {
      logger.error('Old ENDED streams cleanup job failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
