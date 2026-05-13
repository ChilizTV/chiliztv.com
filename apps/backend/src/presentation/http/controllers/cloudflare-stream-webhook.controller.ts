import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { container } from '../../../infrastructure/config/di-container';
import { StreamLifecycleService } from '../../../infrastructure/services/StreamLifecycleService';
import { env } from '../../../infrastructure/config/environment';
import { logger } from '../../../infrastructure/logging/logger';
import { CfLiveInputWebhookPayload, CfVideoWebhookPayload } from '../../../infrastructure/streaming/cloudflare-stream-api.types';

const REPLAY_WINDOW_SECONDS = 300;

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
  /**
   * POST /cloudflare-stream/webhook
   * Receives signed events from Cloudflare Stream and dispatches lifecycle transitions.
   * Raw body must be available on req.body (express.raw middleware scoped to this route).
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
      return;
    }

    // On-demand / recording ready event: raw video object with uid + liveInput
    // Ref: https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
    if (typeof payload['uid'] === 'string') {
      const video = payload as unknown as CfVideoWebhookPayload;
      if (video.readyToStream) {
        logger.info('CF webhook: recording ready', { videoUid: video.uid, liveInput: video.liveInput });
      }
      return;
    }

    logger.warn('CF webhook: unrecognized payload shape', { payload });
  }
}
