import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { SourceType, Stream, StreamStatus } from '@chiliztv/domain/streams/entities/Stream';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { logger } from '../../logging/logger';

interface StreamRow {
  id: string;
  match_id: number;
  streamer_id: string;
  streamer_name: string;
  streamer_wallet_address?: string;
  stream_key: string;
  hls_playlist_url?: string;
  title?: string;
  thumbnail_url?: string;
  status: 'created' | 'live' | 'ended';
  source_type: SourceType;
  last_heartbeat_at?: string;
  viewer_count: number;
  created_at: string;
  ended_at?: string;
  cloudflare_input_uid?: string;
  cloudflare_rtmps_url?: string;
  cloudflare_rtmps_stream_key?: string;
  cloudflare_playback_hls_url?: string;
  cloudflare_webrtc_publish_url?: string;
  recording_video_uid?: string;
  recording_hls_url?: string;
  recording_ready_at?: string;
}

@injectable()
export class SupabaseStreamRepository implements IStreamRepository {
  async save(stream: Stream): Promise<Stream> {
    const row = this.toRow(stream);
    const { data, error } = await supabase.from('live_streams').insert(row).select().single();
    if (error) { logger.error('Failed to save stream', { error: error.message }); throw new Error('Failed to save stream'); }
    return this.toDomain(data);
  }

  async findById(id: string): Promise<Stream | null> {
    const { data: row, error } = await supabase.from('live_streams').select('*').eq('id', id).maybeSingle();
    if (error) { logger.error('Failed to find stream by id', { error: error.message, id }); throw new Error('Failed to find stream'); }
    return row ? this.toDomain(row) : null;
  }

  async findByStreamKey(streamKey: string): Promise<Stream | null> {
    const { data: row, error } = await supabase.from('live_streams').select('*').eq('stream_key', streamKey).maybeSingle();
    if (error) { logger.error('Failed to find stream by key', { error: error.message, streamKey }); throw new Error('Failed to find stream'); }
    return row ? this.toDomain(row) : null;
  }

  async findByStreamerId(streamerId: string): Promise<Stream | null> {
    const { data: row, error } = await supabase
      .from('live_streams').select('*').eq('streamer_id', streamerId).eq('status', 'live')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error) { logger.error('Failed to find stream by streamer id', { error: error.message, streamerId }); throw new Error('Failed to find stream by streamer id'); }
    return row ? this.toDomain(row) : null;
  }

  async findByCloudflareInputUid(uid: string): Promise<Stream | null> {
    const { data: row, error } = await supabase
      .from('live_streams').select('*').eq('cloudflare_input_uid', uid).maybeSingle();
    if (error) { logger.error('Failed to find stream by CF input uid', { error: error.message, uid }); throw new Error('Failed to find stream'); }
    return row ? this.toDomain(row) : null;
  }

  async findActiveStreams(): Promise<Stream[]> {
    const { data: rows, error } = await supabase.from('live_streams').select('*').eq('status', 'live').order('created_at', { ascending: false });
    if (error) { logger.error('Failed to find active streams', { error: error.message }); throw new Error('Failed to find active streams'); }
    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findActiveByMatchIds(matchIds: number[]): Promise<Stream[]> {
    if (matchIds.length === 0) return [];
    // Drop 'created' from the listing — those rows are setup placeholders
    // and nothing is being published yet (cf. D8).
    const { data: rows, error } = await supabase.from('live_streams').select('*').eq('status', 'live').in('match_id', matchIds).order('viewer_count', { ascending: false });
    if (error) { logger.error('Failed to find active streams by match ids', { error: error.message }); throw new Error('Failed to find active streams by match ids'); }
    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findStaleLiveStreams(olderThan: Date): Promise<Stream[]> {
    // Filter source_type='browser' — OBS streams have no client heartbeat;
    // their lifecycle is driven by provider webhooks.
    const { data: rows, error } = await supabase.from('live_streams').select('*').eq('status', 'live').eq('source_type', 'browser').not('last_heartbeat_at', 'is', null).lt('last_heartbeat_at', olderThan.toISOString());
    if (error) { logger.error('Failed to find stale live streams', { error: error.message }); throw new Error('Failed to find stale live streams'); }
    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findLiveCloudflareStreams(): Promise<Stream[]> {
    const { data: rows, error } = await supabase
      .from('live_streams').select('*').eq('status', 'live').not('cloudflare_input_uid', 'is', null);
    if (error) { logger.error('Failed to find live CF streams', { error: error.message }); throw new Error('Failed to find live CF streams'); }
    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findStaleCreatedStreams(olderThan: Date): Promise<Stream[]> {
    const { data: rows, error } = await supabase.from('live_streams').select('*').eq('status', 'created').lt('created_at', olderThan.toISOString());
    if (error) { logger.error('Failed to find stale created streams', { error: error.message }); throw new Error('Failed to find stale created streams'); }
    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async findOldEndedStreams(before: Date): Promise<Stream[]> {
    const { data: rows, error } = await supabase.from('live_streams').select('*').eq('status', 'ended').not('ended_at', 'is', null).lt('ended_at', before.toISOString());
    if (error) { logger.error('Failed to find old ended streams', { error: error.message }); throw new Error('Failed to find old ended streams'); }
    return rows ? rows.map(row => this.toDomain(row)) : [];
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('live_streams').delete().eq('id', id);
    if (error) { logger.error('Failed to delete stream', { error: error.message, id }); throw new Error('Failed to delete stream'); }
  }

  async update(stream: Stream): Promise<Stream> {
    const row = this.toRow(stream);
    const { data, error } = await supabase.from('live_streams').update(row).eq('id', stream.getId()).select().single();
    if (error) { logger.error('Failed to update stream', { error: error.message, id: stream.getId() }); throw new Error('Failed to update stream'); }
    return this.toDomain(data);
  }

  private toDomain(row: StreamRow): Stream {
    let status: StreamStatus;
    if (row.status === 'live') status = StreamStatus.LIVE;
    else if (row.status === 'created') status = StreamStatus.CREATED;
    else status = StreamStatus.ENDED;

    // Pre-migration rows may have a NULL source_type column hydrated as undefined here;
    // the SQL DEFAULT 'obs' covers new writes, this fallback covers stale reads.
    const sourceType: SourceType = row.source_type === 'browser' ? 'browser' : 'obs';

    return Stream.reconstitute({
      id: row.id,
      matchId: row.match_id,
      streamerId: row.streamer_id,
      streamerName: row.streamer_name,
      streamerWalletAddress: row.streamer_wallet_address,
      streamKey: row.stream_key,
      hlsUrl: row.hls_playlist_url,
      title: row.title,
      thumbnailUrl: row.thumbnail_url,
      status,
      sourceType,
      lastHeartbeatAt: row.last_heartbeat_at ? new Date(row.last_heartbeat_at) : undefined,
      viewerCount: row.viewer_count,
      endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
      createdAt: new Date(row.created_at),
      cloudflareInputUid: row.cloudflare_input_uid,
      cloudflareRtmpsUrl: row.cloudflare_rtmps_url,
      cloudflareRtmpsStreamKey: row.cloudflare_rtmps_stream_key,
      cloudflarePlaybackHlsUrl: row.cloudflare_playback_hls_url,
      cloudflareWebRtcPublishUrl: row.cloudflare_webrtc_publish_url,
      recordingVideoUid: row.recording_video_uid,
      recordingHlsUrl: row.recording_hls_url,
      recordingReadyAt: row.recording_ready_at ? new Date(row.recording_ready_at) : undefined,
    });
  }

  private toRow(stream: Stream): Omit<StreamRow, never> {
    const json = stream.toJSON();
    return {
      id: json.id,
      match_id: json.matchId,
      streamer_id: json.streamerId,
      streamer_name: json.streamerName,
      streamer_wallet_address: json.streamerWalletAddress?.toLowerCase() || undefined,
      stream_key: json.streamKey,
      hls_playlist_url: json.hlsUrl,
      title: json.title || undefined,
      thumbnail_url: json.thumbnailUrl ?? undefined,
      status: json.status,
      source_type: json.sourceType,
      last_heartbeat_at: json.lastHeartbeatAt ? (json.lastHeartbeatAt as Date).toISOString() : undefined,
      viewer_count: json.viewerCount,
      created_at: (json.createdAt as Date).toISOString(),
      ended_at: json.endedAt ? (json.endedAt as Date).toISOString() : undefined,
      cloudflare_input_uid: json.cloudflareInputUid,
      cloudflare_rtmps_url: json.cloudflareRtmpsUrl,
      cloudflare_rtmps_stream_key: json.cloudflareRtmpsStreamKey,
      cloudflare_playback_hls_url: json.cloudflarePlaybackHlsUrl,
      cloudflare_webrtc_publish_url: json.cloudflareWebRtcPublishUrl,
      recording_video_uid: json.recordingVideoUid,
      recording_hls_url: json.recordingHlsUrl,
      recording_ready_at: json.recordingReadyAt ? (json.recordingReadyAt as Date).toISOString() : undefined,
    };
  }
}
