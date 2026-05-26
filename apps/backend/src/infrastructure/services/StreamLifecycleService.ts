import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { IStreamingService } from '@chiliztv/domain/streams/ports/IStreamingService';
import { Stream, StreamStatus } from '@chiliztv/domain/streams/entities/Stream';
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
    @inject(TOKENS.IStreamingService)
    private readonly streamingService: IStreamingService,
  ) {}

  async startStreamByLiveInput(uid: string): Promise<void> {
    if (this.inFlight.has(uid)) {
      logger.debug('startStreamByLiveInput: in-flight, skipping', { uid });
      return;
    }
    this.inFlight.add(uid);
    try {
      let stream = await this.streamRepository.findByCloudflareInputUid(uid);

      if (!stream) {
        // No DB row yet. Verify the publisher is currently connected before
        // creating the row — avoids spurious LIVE rows when called from the
        // polling path and OBS has not yet started streaming.
        let status;
        try {
          status = await this.streamingService.getLiveInputStatus(uid);
        } catch (err) {
          logger.warn('startStreamByLiveInput: failed to check CF status', {
            uid,
            err: err instanceof Error ? err.message : String(err),
          });
          return;
        }
        if (!status.connected) {
          logger.debug('startStreamByLiveInput: live input not connected, skipping', { uid });
          return;
        }

        // Publisher is connected — create the DB row directly as LIVE using the
        // stream metadata embedded in the CF live input at creation time.
        let details;
        try {
          details = await this.streamingService.getLiveInputDetails(uid);
        } catch (err) {
          logger.error('startStreamByLiveInput: failed to fetch CF live input details', {
            uid,
            err: err instanceof Error ? err.message : String(err),
          });
          return;
        }

        const { streamMeta, ...liveInput } = details;
        const newStream = Stream.reconstitute({
          id: streamMeta.streamId,
          matchId: streamMeta.matchId,
          streamerId: streamMeta.streamerId,
          streamerName: streamMeta.streamerName,
          streamerWalletAddress: streamMeta.streamerWalletAddress,
          streamKey: liveInput.rtmpsStreamKey,
          title: streamMeta.title,
          status: StreamStatus.LIVE,
          sourceType: streamMeta.sourceType,
          viewerCount: 0,
          cloudflareInputUid: uid,
          cloudflareRtmpsUrl: liveInput.rtmpsUrl,
          cloudflareRtmpsStreamKey: liveInput.rtmpsStreamKey,
          cloudflarePlaybackHlsUrl: liveInput.playbackHlsUrl,
          cloudflareWebRtcPublishUrl: liveInput.webRtcPublishUrl,
          hlsUrl: liveInput.playbackHlsUrl,
          createdAt: new Date(),
        });
        newStream.heartbeat();

        try {
          await this.streamRepository.save(newStream);
          logger.info('Stream created as LIVE via CF webhook', {
            uid,
            streamId: streamMeta.streamId,
            streamerId: streamMeta.streamerId,
          });
        } catch {
          // Race: another webhook already created the row. Re-find and heartbeat.
          const existing = await this.streamRepository.findByCloudflareInputUid(uid);
          if (existing) {
            existing.heartbeat();
            await this.streamRepository.update(existing);
          }
        }
        return;
      }

      const previousStatus = stream.getStatus();
      if (previousStatus === StreamStatus.LIVE) {
        stream.heartbeat();
        await this.streamRepository.update(stream);
        logger.debug('Stream heartbeat refreshed via CF webhook', { uid });
        return;
      }
      stream.start();
      stream.heartbeat();
      await this.streamRepository.update(stream);
      logger.info('Stream lifecycle change via CF webhook', {
        uid,
        previousStatus,
        newStatus: StreamStatus.LIVE,
      });
    } finally {
      this.inFlight.delete(uid);
    }
  }

  /**
   * Checks CF API for the live input connection status. If OBS has disconnected,
   * ends the DB row. Called from the OBSSetupPanel polling path as a fallback
   * when the `live_input.disconnected` webhook is not delivered.
   * On CF API error: keeps the current DB state (fail-safe).
   */
  async checkAndEndIfDisconnected(uid: string): Promise<void> {
    let status;
    try {
      status = await this.streamingService.getLiveInputStatus(uid);
    } catch (err) {
      logger.warn('checkAndEndIfDisconnected: CF status check failed — keeping current state', {
        uid,
        err: err instanceof Error ? err.message : String(err),
      });
      return;
    }
    if (!status.connected) {
      await this.endStreamByLiveInput(uid);
    }
  }

  async endStreamByLiveInput(uid: string): Promise<void> {
    const stream = await this.streamRepository.findByCloudflareInputUid(uid);
    if (!stream) {
      logger.warn('endStreamByLiveInput: uid not found', { uid });
      return;
    }
    const previousStatus = stream.getStatus();
    if (previousStatus !== StreamStatus.LIVE) {
      logger.debug('endStreamByLiveInput: not LIVE, skipping', { uid, previousStatus });
      return;
    }
    stream.end();
    await this.streamRepository.update(stream);
    logger.info('Stream lifecycle change via CF webhook', {
      uid,
      previousStatus,
      newStatus: StreamStatus.ENDED,
    });
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
      logger.warn('heartbeat: streamerId mismatch — denied', {
        streamId,
        owner: stream.getStreamerId(),
        claimant: streamerId,
      });
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

  /**
   * Persist the recording metadata from a Cloudflare Stream recording-ready
   * webhook. Gated on `status === ENDED` to avoid racing a mid-reconnect:
   * if the publisher dropped briefly and the row is still flagged LIVE, we
   * skip the write — the next recording-ready (or a manual repair) will fix it.
   */
  async attachRecording(
    uid: string,
    recording: { videoUid: string; hlsUrl: string; readyAt: Date },
  ): Promise<void> {
    const stream = await this.streamRepository.findByCloudflareInputUid(uid);
    if (!stream) {
      logger.warn('attachRecording: stream not found', { uid, videoUid: recording.videoUid });
      return;
    }
    if (stream.getStatus() !== StreamStatus.ENDED) {
      logger.warn('attachRecording skipped: stream not ended', {
        uid,
        streamId: stream.getId(),
        status: stream.getStatus(),
      });
      return;
    }
    stream.attachRecording(recording.videoUid, recording.hlsUrl, recording.readyAt);
    await this.streamRepository.update(stream);
    logger.info('Recording attached to stream', {
      uid,
      streamId: stream.getId(),
      videoUid: recording.videoUid,
    });
  }

  /** Called by the stale cleanup job to retire browser LIVE streams whose heartbeat expired. */
  async endStaleLive(streamKey: string): Promise<void> {
    const stream = await this.streamRepository.findByStreamKey(streamKey);
    if (!stream) return;
    if (stream.getStatus() !== StreamStatus.LIVE) return;
    stream.end();
    await this.streamRepository.update(stream);
    logger.info('Stale LIVE browser stream ended', { streamKey });
  }

  /**
   * Used by the stale cleanup job to retire CREATED placeholders that never
   * had a publisher attach. Applies to browser streams only — OBS streams are
   * not persisted as CREATED rows.
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
