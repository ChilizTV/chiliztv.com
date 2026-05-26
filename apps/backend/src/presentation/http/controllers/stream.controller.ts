import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { CreateStreamUseCase } from '../../../application/streams/use-cases/CreateStreamUseCase';
import { GetActiveStreamsUseCase } from '../../../application/streams/use-cases/GetActiveStreamsUseCase';
import { GetPreferredStreamUseCase } from '../../../application/streams/use-cases/GetPreferredStreamUseCase';
import { EndStreamUseCase } from '../../../application/streams/use-cases/EndStreamUseCase';
import { UpdateViewerCountUseCase } from '../../../application/streams/use-cases/UpdateViewerCountUseCase';
import { StreamLifecycleService } from '../../../infrastructure/services/StreamLifecycleService';
import { ViewerSessionService } from '../../../infrastructure/services/ViewerSessionService';
import { supabaseClient as supabase } from '../../../infrastructure/database/supabase/client';
import { logger } from '../../../infrastructure/logging/logger';

const METRIC_FALLBACK_KEY = 'metrics:cfstream:fallback:24h';
const METRIC_TTL_SECONDS = 86400;

@injectable()
export class StreamController {
  constructor(
    @inject(CreateStreamUseCase)
    private readonly createStreamUseCase: CreateStreamUseCase,
    @inject(GetActiveStreamsUseCase)
    private readonly getActiveStreamsUseCase: GetActiveStreamsUseCase,
    @inject(GetPreferredStreamUseCase)
    private readonly getPreferredStreamUseCase: GetPreferredStreamUseCase,
    @inject(EndStreamUseCase)
    private readonly endStreamUseCase: EndStreamUseCase,
    @inject(UpdateViewerCountUseCase)
    private readonly updateViewerCountUseCase: UpdateViewerCountUseCase,
    @inject(StreamLifecycleService)
    private readonly lifecycleService: StreamLifecycleService,
    @inject(ViewerSessionService)
    private readonly viewerSessionService: ViewerSessionService,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
  ) {}

  async createStream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { matchId, streamerId, streamerName, streamerWalletAddress, title, sourceType } = req.body;

      const stream = await this.createStreamUseCase.execute({
        matchId,
        streamerId,
        streamerName,
        streamerWalletAddress,
        title,
        sourceType: sourceType === 'browser' ? 'browser' : undefined,
      });

      res.status(201).json({
        success: true,
        stream: stream.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreferredStream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matchId = parseInt(req.query['matchId'] as string);
      const userId = req.query['userId'] as string | undefined;

      if (!matchId || isNaN(matchId)) {
        res.status(400).json({ error: 'matchId required' });
        return;
      }

      const result = await this.getPreferredStreamUseCase.execute(matchId, userId);
      res.json({ success: true, stream: result.stream?.toJSON() ?? null, source: result.source });
    } catch (error) {
      next(error);
    }
  }

  async getActiveStreams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matchIdRaw = req.query['matchId'] as string | undefined;
      const matchId = matchIdRaw ? parseInt(matchIdRaw) : undefined;
      const streamerId = req.query['streamerId'] as string | undefined;
      const cloudflareInputUid = req.query['cloudflareInputUid'] as string | undefined;

      let streams = await this.getActiveStreamsUseCase.execute(matchId, streamerId);

      if (streamerId && cloudflareInputUid) {
        if (streams.length === 0) {
          // OBS not connected yet — check CF API and create the LIVE row if connected.
          // Fallback-rate counter: pairs with the webhook counter; a sustained
          // `fallback / (webhook + fallback)` > 20% signals a webhook outage.
          await this.cache.incr(METRIC_FALLBACK_KEY, METRIC_TTL_SECONDS);
          await this.lifecycleService.startStreamByLiveInput(cloudflareInputUid);
          streams = await this.getActiveStreamsUseCase.execute(matchId, streamerId);
        } else {
          // OBS is LIVE in DB — verify CF still shows the publisher connected.
          // Ends the DB row immediately when OBS stops (webhook delivery fallback).
          const obsLive = streams.find(
            s =>
              s.getCloudflareInputUid() === cloudflareInputUid &&
              s.isLive() &&
              s.getSourceType() === 'obs',
          );
          if (obsLive) {
            await this.cache.incr(METRIC_FALLBACK_KEY, METRIC_TTL_SECONDS);
            await this.lifecycleService.checkAndEndIfDisconnected(cloudflareInputUid);
            streams = await this.getActiveStreamsUseCase.execute(matchId, streamerId);
          }
        }
      }

      res.json({
        success: true,
        streams: streams.map(s => s.toJSON()),
        count: streams.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async endStream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { streamId, streamKey, cloudflareInputUid } = req.body;

      await this.endStreamUseCase.execute({ streamId, streamKey, cloudflareInputUid });

      res.json({
        success: true,
        message: 'Stream ended successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateViewerCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { streamId } = req.params;
      const { viewerCount } = req.body;

      await this.updateViewerCountUseCase.execute(streamId, viewerCount);

      res.json({ success: true, message: 'Viewer count updated' });
    } catch (error) {
      next(error);
    }
  }

  async heartbeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { streamerId } = req.body as { streamerId?: string };
      if (!streamerId) {
        res.status(400).json({ error: 'streamerId required' });
        return;
      }
      const ok = await this.lifecycleService.heartbeat(id, streamerId);
      if (!ok) {
        res.status(404).json({ error: 'Stream not found, not live, or ownership mismatch' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Beacon endpoint hit by `navigator.sendBeacon` on `pagehide` for browser
   * streams. **No JWT** — sendBeacon strips Authorization. Sécurité = match
   * `{ streamId, streamerId }` contre la row avant `end()`.
   */
  async beacon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { streamId, streamerId } = req.body as { streamId?: string; streamerId?: string };
      if (!streamId || !streamerId) {
        res.status(204).end();
        return;
      }
      // Resolve the stream row, verify ownership, then end it.
      // endStreamViaBeacon is idempotent and status-gated.
      const stream = await this.lifecycleService.endStreamViaBeacon(streamId, streamerId);
      if (!stream) {
        logger.warn('beacon: rejected (not found or ownership mismatch)', { streamId, streamerId });
      }
      res.status(204).end();
    } catch (error) {
      // Beacon should never 500 — the browser is leaving the page anyway.
      logger.error('beacon handler error', { error: error instanceof Error ? error.message : String(error) });
      res.status(204).end();
      next();
    }
  }

  async joinViewer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { sessionToken } = req.body;
      if (!sessionToken) { res.status(400).json({ error: 'sessionToken required' }); return; }
      await this.viewerSessionService.join(id, sessionToken);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async leaveViewer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { sessionToken } = req.body;
      if (!sessionToken) { res.status(400).json({ error: 'sessionToken required' }); return; }
      await this.viewerSessionService.leave(id, sessionToken);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async uploadThumbnail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = (req as Request & { file?: Express.Multer.File }).file;

      if (!file) { res.status(400).json({ error: 'No file uploaded' }); return; }
      if (file.mimetype !== 'image/jpeg') { res.status(400).json({ error: 'Only image/jpeg accepted' }); return; }

      if (this.viewerSessionService.isThumbnailThrottled(id)) {
        res.json({ success: true, throttled: true });
        return;
      }

      const path = `${id}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('stream-thumbnails')
        .upload(path, file.buffer, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) {
        logger.warn('Thumbnail upload failed', { id, error: uploadError.message });
        res.status(500).json({ error: 'Upload failed' });
        return;
      }

      const { data: urlData } = supabase.storage.from('stream-thumbnails').getPublicUrl(path);
      const thumbnailUrl = urlData.publicUrl;

      await supabase.from('live_streams').update({ thumbnail_url: thumbnailUrl }).eq('id', id);

      res.json({ success: true, thumbnailUrl });
    } catch (error) {
      next(error);
    }
  }
}
