import { injectable } from 'tsyringe';
import {
  IStreamingService,
  LiveInputDetails,
  LiveInputResult,
  StreamMeta,
} from '@chiliztv/domain/streams/ports/IStreamingService';
import { env } from '../config/environment';
import { cfCreateLiveInput, cfDeleteLiveInput, cfGetLiveInput } from './cloudflare-stream-api';
import { logger } from '../logging/logger';

@injectable()
export class CloudflareStreamService implements IStreamingService {
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
    const input = await cfGetLiveInput(uid);
    const state = input.status?.current?.state;
    return { connected: state === 'connected' };
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
