import { inject, injectable } from 'tsyringe';
import { container } from '../../config/di-container';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { IStreamingService } from '@chiliztv/domain/streams/ports/IStreamingService';
import { StreamLifecycleService } from '../../services/StreamLifecycleService';
import { logger } from '../../logging/logger';

/**
 * Cloudflare Stream Reconciliation Job
 * Runs every 5 minutes. Fetches all LIVE streams with a CF input UID and
 * checks their actual connection state via the CF API. Ends any stream
 * that is marked LIVE in the DB but reported as disconnected by CF.
 *
 * Acts as a safety net for lost webhooks (backend restart, network timeout).
 */
@injectable()
export class CloudflareReconcileJob {
  private readonly schedule = '*/5 * * * *';

  constructor(
    @inject(TOKENS.IStreamingService)
    private readonly streamingService: IStreamingService,
  ) {}

  getSchedule(): string {
    return this.schedule;
  }

  async execute(): Promise<void> {
    const streamRepository = container.resolve<IStreamRepository>(TOKENS.IStreamRepository);
    const lifecycleService = container.resolve(StreamLifecycleService);

    let streams;
    try {
      streams = await streamRepository.findLiveCloudflareStreams();
    } catch (err) {
      logger.error('CloudflareReconcileJob: failed to fetch live CF streams', {
        err: err instanceof Error ? err.message : 'Unknown error',
      });
      return;
    }

    for (const stream of streams) {
      const uid = stream.getCloudflareInputUid();
      if (!uid) continue;

      try {
        const { connected } = await this.streamingService.getLiveInputStatus(uid);
        if (!connected) {
          logger.warn('CloudflareReconcileJob: stream LIVE in DB but not connected on CF', { uid });
          await lifecycleService.endStreamByLiveInput(uid);
        }
      } catch (err) {
        logger.error('CloudflareReconcileJob: failed to check CF status', {
          uid,
          err: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  }
}
