import { injectable, inject } from 'tsyringe';
import {
  IStreamingService,
  LiveInputDetails,
  LiveInputResult,
  StreamMeta,
} from '@chiliztv/domain/streams/ports/IStreamingService';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { env } from '../config/environment';
import { cfCreateLiveInput, cfDeleteLiveInput, cfGetLiveInput } from './cloudflare-stream-api';
import { logger } from '../logging/logger';

// TTL shorter than the 4s OBS poll cadence so the cache absorbs the spike of
// N machines × poll concurrency without ever stalling a state transition.
const STATUS_CACHE_TTL_SECONDS = 3;

@injectable()
export class CloudflareStreamService implements IStreamingService {
  constructor(
    @inject(TOKENS.ICacheService) private readonly cache: ICacheService,
  ) {}

  async createLiveInput(params: {
    name: string;
    matchId: number;
    streamerWallet?: string;
    streamMeta: StreamMeta;
  }): Promise<LiveInputResult> {
    const input = await cfCreateLiveInput(params);
    const playbackHlsUrl =
      `https://${env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN}.cloudflarestream.com` +
      `/${input.uid}/manifest/video.m3u8`;

    return {
      uid: input.uid,
      rtmpsUrl: input.rtmps.url,
      rtmpsStreamKey: input.rtmps.streamKey,
      webRtcPublishUrl: input.webRTC.url,
      playbackHlsUrl,
    };
  }

  async deleteLiveInput(uid: string): Promise<void> {
    await cfDeleteLiveInput(uid);
  }

  async getLiveInputStatus(uid: string): Promise<{ connected: boolean }> {
    const value = await this.cache.getOrLoad<{ connected: boolean }>({
      key: `stream:cf:status:${uid.toLowerCase()}`,
      ttlSeconds: STATUS_CACHE_TTL_SECONDS,
      // No jitter — poll cadence is 4s, any spread risks a visible status stall.
      jitterPct: 0,
      loader: async () => {
        const input = await cfGetLiveInput(uid);
        const state = input.status?.current?.state;
        // Match any `connected*` variant (e.g. `connected`, future
        // `connected-resumed`) so a CF state addition doesn't silently end
        // live streams. `disconnected` is excluded by the prefix check.
        const connected = typeof state === 'string' && state.startsWith('connected');
        return { connected };
      },
    });
    return value ?? { connected: false };
  }

  async getLiveInputDetails(uid: string): Promise<LiveInputDetails> {
    const input = await cfGetLiveInput(uid);
    const meta = input.meta ?? {};

    const matchIdParsed = parseInt(meta.matchId ?? '0', 10);
    if (!meta.streamId || !meta.streamerId || !meta.streamerName || isNaN(matchIdParsed) || matchIdParsed === 0) {
      logger.warn('CF live input meta is incomplete — cannot reconstruct stream', { uid, meta });
      throw new Error(`CF live input ${uid} has missing or invalid meta fields`);
    }

    const streamMeta: StreamMeta = {
      streamId: meta.streamId,
      streamerId: meta.streamerId,
      streamerName: meta.streamerName,
      matchId: matchIdParsed,
      streamerWalletAddress: meta.streamerWalletAddress,
      sourceType: meta.sourceType === 'browser' ? 'browser' : 'obs',
      title: meta.title,
    };

    const playbackHlsUrl =
      `https://${env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN}.cloudflarestream.com` +
      `/${uid}/manifest/video.m3u8`;

    return {
      uid: input.uid,
      rtmpsUrl: input.rtmps.url,
      rtmpsStreamKey: input.rtmps.streamKey,
      webRtcPublishUrl: input.webRTC.url,
      playbackHlsUrl,
      streamMeta,
    };
  }
}
