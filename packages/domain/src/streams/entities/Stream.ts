import { LiveInputResult } from '../ports/IStreamingService';

export enum StreamStatus {
  CREATED = 'created',
  LIVE    = 'live',
  ENDED   = 'ended',
}

/**
 * Discriminates the publisher path. Immutable post-creation.
 *  - 'obs'     — RTMP/RTMPS via the streaming provider; lifecycle driven by webhooks.
 *  - 'browser' — WHIP/WebRTC; requires client heartbeat + beacon for cleanup.
 */
export type SourceType = 'obs' | 'browser';

export interface StreamProps {
  id: string;
  matchId: number;
  streamerId: string;
  streamerName: string;
  streamerWalletAddress?: string;
  streamKey: string;
  hlsUrl?: string;
  title?: string;
  thumbnailUrl?: string;
  status: StreamStatus;
  sourceType: SourceType;
  lastHeartbeatAt?: Date;
  viewerCount: number;
  endedAt?: Date;
  createdAt: Date;
  // Cloudflare Stream fields — populated when created via CloudflareStreamService
  cloudflareInputUid?: string;
  cloudflareRtmpsUrl?: string;
  cloudflareRtmpsStreamKey?: string;
  cloudflarePlaybackHlsUrl?: string;
  cloudflareWebRtcPublishUrl?: string;
}

export class Stream {
  private constructor(private props: StreamProps) {}

  static create(props: Omit<StreamProps, 'id' | 'createdAt'>): Stream {
    const now = new Date();
    return new Stream({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
    });
  }

  static reconstitute(props: StreamProps): Stream {
    return new Stream(props);
  }

  /** Transition to LIVE. No-op if already LIVE (idempotent). */
  start(): void {
    if (this.props.status === StreamStatus.LIVE) return;
    this.props.status = StreamStatus.LIVE;
  }

  /** Transition to ENDED. No-op if already ENDED (idempotent). */
  end(): void {
    if (this.props.status === StreamStatus.ENDED) return;
    this.props.status = StreamStatus.ENDED;
    this.props.endedAt = new Date();
  }

  /** Refresh heartbeat timestamp — guarantees lastHeartbeatAt is non-null while LIVE. */
  heartbeat(): void {
    this.props.lastHeartbeatAt = new Date();
  }

  /** Populate all Cloudflare Stream fields from a live input creation result. */
  attachCloudflareInput(result: LiveInputResult): void {
    this.props.cloudflareInputUid = result.uid;
    this.props.cloudflareRtmpsUrl = result.rtmpsUrl;
    this.props.cloudflareRtmpsStreamKey = result.rtmpsStreamKey;
    this.props.cloudflarePlaybackHlsUrl = result.playbackHlsUrl;
    this.props.cloudflareWebRtcPublishUrl = result.webRtcPublishUrl;
    this.props.hlsUrl = result.playbackHlsUrl;
  }

  getStatus(): StreamStatus {
    return this.props.status;
  }

  updateViewerCount(count: number): void {
    this.props.viewerCount = count;
  }

  getId(): string {
    return this.props.id;
  }

  getStreamKey(): string {
    return this.props.streamKey;
  }

  getStreamerId(): string {
    return this.props.streamerId;
  }

  getSourceType(): SourceType {
    return this.props.sourceType;
  }

  getCloudflareInputUid(): string | undefined {
    return this.props.cloudflareInputUid;
  }

  /** Backward-compatible helper. Returns true only when status is LIVE. */
  isLive(): boolean {
    return this.props.status === StreamStatus.LIVE;
  }

  toJSON(): StreamProps & { isLive: boolean } {
    return {
      ...this.props,
      isLive: this.props.status === StreamStatus.LIVE,
    };
  }
}
