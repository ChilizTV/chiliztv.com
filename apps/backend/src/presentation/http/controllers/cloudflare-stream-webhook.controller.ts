import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { container } from '../../../infrastructure/config/di-container';
import { StreamLifecycleService } from '../../../infrastructure/services/StreamLifecycleService';
import { env } from '../../../infrastructure/config/environment';
import { logger } from '../../../infrastructure/logging/logger';
import { CfLiveInputWebhookPayload, CfVideoWebhookPayload } from '../../../infrastructure/streaming/cloudflare-stream-api.types';

const IDEMPOTENCY_TTL_SECONDS = 300;

const REPLAY_WINDOW_SECONDS = 300;

const METRIC_WEBHOOK_KEY = 'metrics:cfstream:webhook:24h';
const METRIC_TTL_SECONDS = 86400;

function verifySignature(rawBody: Buffer, header: string): boolean {
  // header format: "time=<unix>,sig1=<hex>"
  const parts = Object.fromEntries(
    header.split(',').map(p => p.split('=') as [string, string]),
  );
  const timestamp = parseInt(parts['time'] ?? '', 10);
  const sig1 = parts['sig1'] ?? '';

  if (!timestamp || !sig1) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - timestamp);
  if (ageSeconds > REPLAY_WINDOW_SECONDS) return false;

  const expected = createHmac('sha256', env.CLOUDFLARE_STREAM_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex');

  try {
    return timingSafeEqual(Buffer.from(sig1, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

@injectable()
export class CloudflareStreamWebhookController {
  constructor(
    @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
  ) {}

  /**
   * POST /cloudflare-stream/webhook
   * Receives signed events from Cloudflare Stream and dispatches lifecycle transitions.
   * Raw body must be available on req.body (express.raw middleware scoped to this route).
   *
   * Idempotency (cf. docs/plans/redis-integration.md §2.17): Cloudflare retries
   * on 5xx / timeout, so the same payload may arrive multiple times. The dedup
   * key is `sha256(raw body)` — a redelivery has the same body, distinct
   * events have distinct bodies. SETNX returns false on the second delivery
   * and we respond 200 without rerunning the lifecycle transition.
   */
  async handle(req: Request, res: Response): Promise<void> {
    const signatureHeader = req.headers['webhook-signature'];
    if (typeof signatureHeader !== 'string') {
      res.status(401).json({ error: 'Missing webhook-signature header' });
      return;
    }

    const rawBody = req.body as Buffer;
    if (!verifySignature(rawBody, signatureHeader)) {
      logger.warn('CF webhook: signature verification failed', { ip: req.ip });
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>;
    } catch {
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }

    const bodyHash = createHash('sha256').update(rawBody).digest('hex');
    const idemKey = `idem:webhook:cfstream:${bodyHash}`;
    const seen = await this.cache.get<true>(idemKey);
    if (seen.hit) {
      logger.info('CF webhook: duplicate delivery, skipping reprocessing', { bodyHash });
      res.status(200).end();
      return;
    }
    await this.cache.set(idemKey, true, IDEMPOTENCY_TTL_SECONDS);

    // Respond 200 immediately — lifecycle updates are fire-and-forget
    res.status(200).end();

    const lifecycleService = container.resolve(StreamLifecycleService);

    // Live input lifecycle event: { data: { event_type, input_id }, ts, ... }
    // Ref: https://developers.cloudflare.com/stream/stream-live/webhooks/
    if (payload['data'] && typeof payload['data'] === 'object') {
      const event = payload as unknown as CfLiveInputWebhookPayload;
      const { event_type, input_id } = event.data;

      switch (event_type) {
        case 'live_input.connected':
          logger.info('CF webhook: publisher connected', { uid: input_id });
          lifecycleService.startStreamByLiveInput(input_id).catch(err =>
            logger.error('CF webhook: startStreamByLiveInput failed', { uid: input_id, err: (err as Error).message }),
          );
          break;

        case 'live_input.disconnected':
          logger.info('CF webhook: publisher disconnected', { uid: input_id });
          lifecycleService.endStreamByLiveInput(input_id).catch(err =>
            logger.error('CF webhook: endStreamByLiveInput failed', { uid: input_id, err: (err as Error).message }),
          );
          break;

        case 'live_input.errored':
          logger.warn('CF webhook: live input errored', { uid: input_id, detail: event.data.live_input_errored });
          break;

        default:
          logger.warn('CF webhook: unknown live input event type', { event_type, input_id });
      }
      // Webhook-rate counter — pairs with the fallback counter in stream.controller.ts
      // to expose `fallback / (webhook + fallback)` ratio for outage detection.
      await this.cache.incr(METRIC_WEBHOOK_KEY, METRIC_TTL_SECONDS);
      return;
    }

    // On-demand / recording ready event: raw video object with uid + liveInput
    // Ref: https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
    if (typeof payload['uid'] === 'string') {
      const video = payload as unknown as CfVideoWebhookPayload;
      if (video.readyToStream && video.liveInput) {
        const hlsUrl =
          `https://customer-${env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN}.cloudflarestream.com` +
          `/${video.uid}/manifest/video.m3u8`;
        // Fire-and-forget — response 200 was already flushed at line 90.
        lifecycleService
          .attachRecording(video.liveInput, { videoUid: video.uid, hlsUrl, readyAt: new Date() })
          .catch(err =>
            logger.error('CF webhook: attachRecording failed', {
              videoUid: video.uid,
              liveInput: video.liveInput,
              err: (err as Error).message,
            }),
          );
        logger.info('CF webhook: recording ready', { videoUid: video.uid, liveInput: video.liveInput });
      }
      await this.cache.incr(METRIC_WEBHOOK_KEY, METRIC_TTL_SECONDS);
      return;
    }

    logger.warn('CF webhook: unrecognized payload shape', { payload });
  }
}
