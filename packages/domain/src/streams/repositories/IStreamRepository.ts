import { Stream } from '../entities/Stream';

export interface IStreamRepository {
  save(stream: Stream): Promise<Stream>;
  findById(id: string): Promise<Stream | null>;
  findByStreamKey(streamKey: string): Promise<Stream | null>;
  findByStreamerId(streamerId: string): Promise<Stream | null>;
  findByCloudflareInputUid(uid: string): Promise<Stream | null>;
  findActiveStreams(): Promise<Stream[]>;
  findActiveByMatchIds(matchIds: number[]): Promise<Stream[]>;
  /**
   * LIVE rows with `last_heartbeat_at` older than `olderThan`. Filtered to
   * `source_type='browser'` only — OBS lifecycles are driven by provider
   * webhooks, not by client heartbeat.
   */
  findStaleLiveStreams(olderThan: Date): Promise<Stream[]>;
  /** LIVE rows with a non-null `cloudflare_input_uid` — for disconnect reconciliation. */
  findLiveCloudflareStreams(): Promise<Stream[]>;
  /** CREATED rows older than `olderThan` — orphans from a setup that never published. */
  findStaleCreatedStreams(olderThan: Date): Promise<Stream[]>;
  findOldEndedStreams(before: Date): Promise<Stream[]>;
  delete(id: string): Promise<void>;
  update(stream: Stream): Promise<Stream>;
}
