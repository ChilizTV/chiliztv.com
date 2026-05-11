import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { StreamStatus } from '@chiliztv/domain/streams/entities/Stream';
import { logger } from '../logging/logger';

@injectable()
export class StreamLifecycleService {
  /**
   * Anti-spam: skips duplicate concurrent calls within the same process instance.
   * NOT a distributed lock — business idempotency is guaranteed by entity start()/end().
   */
  private readonly inFlight = new Set<string>();

  constructor(
    @inject(TOKENS.IStreamRepository)
    private readonly streamRepository: IStreamRepository,
  ) {}

  async startStreamIfNeeded(streamKey: string): Promise<void> {
    if (this.inFlight.has(streamKey)) {
      logger.debug('startStreamIfNeeded: in-flight, skipping', { streamKey });
      return;
    }
    this.inFlight.add(streamKey);
    try {
      const stream = await this.streamRepository.findByStreamKey(streamKey);
      if (!stream) {
        logger.warn('startStreamIfNeeded: key not found', { streamKey });
        return;
      }

      const previousStatus = stream.getStatus();
      if (previousStatus === StreamStatus.LIVE) {
        stream.heartbeat();
        await this.streamRepository.update(stream);
        logger.debug('Stream heartbeat refreshed', { streamKey });
        return;
      }

      stream.start();
      stream.heartbeat(); // always set on transition → guarantees lastHeartbeatAt non-null
      await this.streamRepository.update(stream);
      logger.info('Stream lifecycle change', {
        streamKey,
        previousStatus,
        newStatus: StreamStatus.LIVE,
      });
    } finally {
      this.inFlight.delete(streamKey);
    }
  }

  /**
   * Browser-stream keepalive. Ownership-checked: the streamerId in the
   * request body must match the row owner before we touch `last_heartbeat_at`.
   * Returns false when the stream is missing, not LIVE, or owned by someone else.
   */
  async heartbeat(streamId: string, streamerId: string): Promise<boolean> {
    const stream = await this.streamRepository.findById(streamId);
    if (!stream) {
      logger.debug('heartbeat: stream not found', { streamId });
      return false;
    }
    if (stream.getStreamerId() !== streamerId) {
      logger.warn('heartbeat: streamerId mismatch — denied', { streamId, owner: stream.getStreamerId(), claimant: streamerId });
      return false;
    }
    if (stream.getStatus() !== StreamStatus.LIVE) {
      logger.debug('heartbeat: stream not LIVE — skipping', { streamId, status: stream.getStatus() });
      return false;
    }
    stream.heartbeat();
    await this.streamRepository.update(stream);
    return true;
  }

  /**
   * Used by the no-auth beacon endpoint. Verifies ownership before ending —
   * an attacker who guesses `{ streamId, streamerId }` cannot terminate
   * someone else's stream. Returns the stream when ended, null when rejected.
   */
  async endStreamViaBeacon(streamId: string, streamerId: string): Promise<boolean> {
    const stream = await this.streamRepository.findById(streamId);
    if (!stream) return false;
    if (stream.getStreamerId() !== streamerId) return false;
    if (stream.getStatus() !== StreamStatus.LIVE) return true; // idempotent
    stream.end();
    await this.streamRepository.update(stream);
    logger.info('Stream ended via beacon', { streamId, streamerId });
    return true;
  }

  async endStreamIfNeeded(streamKey: string): Promise<void> {
    const stream = await this.streamRepository.findByStreamKey(streamKey);
    if (!stream) {
      logger.warn('endStreamIfNeeded: key not found', { streamKey });
      return;
    }

    const previousStatus = stream.getStatus();
    if (previousStatus !== StreamStatus.LIVE) {
      logger.debug('endStreamIfNeeded: not LIVE, skipping', { streamKey, previousStatus });
      return;
    }

    stream.end();
    await this.streamRepository.update(stream);
    logger.info('Stream lifecycle change', {
      streamKey,
      previousStatus,
      newStatus: StreamStatus.ENDED,
    });
  }

  /**
   * Used by the stale cleanup job to retire CREATED placeholders that never
   * had a publisher attach. Distinct from `endStreamIfNeeded` (LIVE-only).
   */
  async endStaleCreated(streamKey: string): Promise<void> {
    const stream = await this.streamRepository.findByStreamKey(streamKey);
    if (!stream) return;
    if (stream.getStatus() !== StreamStatus.CREATED) return;
    stream.end();
    await this.streamRepository.update(stream);
    logger.info('Orphan CREATED stream ended', {
      streamKey,
      previousStatus: StreamStatus.CREATED,
      newStatus: StreamStatus.ENDED,
    });
  }
}
