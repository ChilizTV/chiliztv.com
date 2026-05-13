import { env } from '../config/environment';
import { logger } from '../logging/logger';
import { CfApiEnvelope, CfLiveInputResponse } from './cloudflare-stream-api.types';
import type { StreamMeta } from '@chiliztv/domain/streams/ports/IStreamingService';

const BASE_URL = 'https://api.cloudflare.com/client/v4';

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function parseResponse<T>(res: Response, context: string): Promise<T> {
  const raw = await res.text();
  let body: CfApiEnvelope<T>;
  try {
    body = JSON.parse(raw) as CfApiEnvelope<T>;
  } catch {
    logger.error(`CF Stream API — ${context}: non-JSON response`, { status: res.status, raw });
    throw new Error(`CF Stream: unexpected response (${res.status})`);
  }
  if (!body.success) {
    const msg = body.errors.map(e => `${e.code}: ${e.message}`).join(', ');
    logger.error(`CF Stream API error — ${context}`, {
      status: res.status,
      errors: body.errors,
      messages: body.messages,
    });
    throw new Error(`CF Stream: ${msg}`);
  }
  return body.result;
}

export async function cfCreateLiveInput(params: {
  name: string;
  matchId: number;
  streamerWallet?: string;
  streamMeta: StreamMeta;
}): Promise<CfLiveInputResponse> {
  const { streamMeta } = params;
  const payload = {
    meta: {
      name: params.name,
      matchId: String(params.matchId),
      ...(params.streamerWallet ? { streamerWallet: params.streamerWallet } : {}),
      // Embed all stream fields so startStreamByLiveInput can reconstruct the DB
      // row directly from the CF webhook without a prior CREATED row in the DB.
      streamId: streamMeta.streamId,
      streamerId: streamMeta.streamerId,
      streamerName: streamMeta.streamerName,
      sourceType: streamMeta.sourceType,
      ...(streamMeta.streamerWalletAddress ? { streamerWalletAddress: streamMeta.streamerWalletAddress } : {}),
      ...(streamMeta.title ? { title: streamMeta.title } : {}),
    },
    recording: { mode: 'automatic' },
  };
  logger.debug('CF Stream: createLiveInput request', {
    url: `${BASE_URL}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
    payload,
  });
  const res = await fetch(
    `${BASE_URL}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    },
  );
  return parseResponse<CfLiveInputResponse>(res, 'createLiveInput');
}

export async function cfDeleteLiveInput(uid: string): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${uid}`,
    { method: 'DELETE', headers: headers() },
  );
  // 404 means already gone — treat as success
  if (res.status === 404) return;
  if (!res.ok) {
    logger.warn('CF Stream: deleteLiveInput non-2xx', { uid, status: res.status });
  }
}

export async function cfGetLiveInput(uid: string): Promise<CfLiveInputResponse> {
  const res = await fetch(
    `${BASE_URL}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/live_inputs/${uid}`,
    { method: 'GET', headers: headers() },
  );
  return parseResponse<CfLiveInputResponse>(res, 'getLiveInput');
}
