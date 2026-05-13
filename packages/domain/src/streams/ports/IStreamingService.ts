/** Metadata embedded in the CF live input — reconstructed from CF meta on webhook. */
export interface StreamMeta {
  streamId: string;
  streamerId: string;
  streamerName: string;
  matchId: number;
  streamerWalletAddress?: string;
  sourceType: 'obs' | 'browser';
  title?: string;
}

/** Result returned by the streaming provider after creating a live input. */
export interface LiveInputResult {
  uid: string;
  rtmpsUrl: string;
  rtmpsStreamKey: string;
  webRtcPublishUrl: string;
  playbackHlsUrl: string;
}

/** Live input result with the embedded stream metadata. */
export interface LiveInputDetails extends LiveInputResult {
  streamMeta: StreamMeta;
}

/** Port for the managed streaming provider (Cloudflare Stream or in-memory mock). */
export interface IStreamingService {
  createLiveInput(params: {
    name: string;
    matchId: number;
    streamerWallet?: string;
    streamMeta: StreamMeta;
  }): Promise<LiveInputResult>;

  deleteLiveInput(uid: string): Promise<void>;

  /** Returns current connection state. Used by the reconciliation job. */
  getLiveInputStatus(uid: string): Promise<{ connected: boolean }>;

  /**
   * Returns credentials + the stream metadata that was embedded in the CF live
   * input at creation time. Used by `startStreamByLiveInput` to create the DB
   * row from the webhook when no row exists yet.
   */
  getLiveInputDetails(uid: string): Promise<LiveInputDetails>;
}
