import { StreamStatus } from '@chiliztv/domain/streams/entities/Stream';

export interface StreamResponseDto {
  id: string;
  matchId: number;
  streamerId: string;
  streamerName: string;
  /** Wallet address du streamer */
  streamerWalletAddress?: string;
  /**
   * Clé OBS/RTMP du stream. Présente dans toutes les réponses backend
   * (via Stream.toJSON()) car mediamtx en a besoin côté client pour
   * construire l'URL HLS.
   */
  streamKey: string;
  /** URL HLS publique pour la lecture du stream. Absente avant le démarrage. */
  hlsUrl?: string;
  status: StreamStatus;
  /** Publisher path. Discriminates cleanup + UI behavior (banner, OBS-first repositioning). */
  sourceType: 'obs' | 'browser';
  /** true si status === StreamStatus.LIVE */
  isLive: boolean;
  viewerCount: number;
  thumbnailUrl?: string;
  title?: string;
  /** ISO 8601 — sérialisé depuis Date */
  createdAt: string;
  /** ISO 8601 — présent si le stream est terminé */
  endedAt?: string;
  /** ISO 8601 — dernier heartbeat reçu */
  lastHeartbeatAt?: string;
}

export interface StreamListResponseDto {
  streams: StreamResponseDto[];
  count: number;
}

export interface PreferredStreamResponseDto {
  stream: StreamResponseDto | null;
  source: 'followed' | 'top_viewer' | 'none';
}

/**
 * Réponse étendue retournée uniquement à la création du stream (POST /stream).
 * Identique à StreamResponseDto mais avec streamKey garanti non-optionnel.
 */
export type CreateStreamResultDto = StreamResponseDto;
