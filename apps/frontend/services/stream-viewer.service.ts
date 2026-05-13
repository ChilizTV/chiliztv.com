import axios from 'axios';
import { StreamListResponse, CreateStreamResponse, LiveStream } from '@/models/stream.model';
import type { CreateStreamDto as CreateStreamRequest } from '@chiliztv/shared/dto/streams/CreateStreamDto';
import { streamsApi } from '@/lib/api/endpoints';

export class StreamViewerService {
    /**
     * Get active streams for a match
     */
    async getActiveStreams(matchId: number): Promise<StreamListResponse> {
        try {
            return await streamsApi.getActive(matchId);
        } catch (error) {
            console.error('❌ Error fetching active streams:', error);
            return {
                success: false,
                streams: [],
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get preferred stream for a user (follow-aware, falls back to top viewer)
     */
    async getPreferredStream(matchId: number, userId?: string): Promise<{ stream: LiveStream | null; source: 'followed' | 'top_viewer' | 'none' }> {
        try {
            return await streamsApi.getPreferred(matchId, userId);
        } catch {
            return { stream: null, source: 'none' };
        }
    }

    /**
     * Create a new stream
     */
    async createStream(request: CreateStreamRequest): Promise<CreateStreamResponse> {
        try {
            return await streamsApi.create(request);
        } catch (error) {
            console.error('❌ Error creating stream:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * End/delete a stream
     */
    async endStream(streamId: string, streamerId: string, cloudflareInputUid?: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            return await streamsApi.end(streamId, streamerId, cloudflareInputUid);
        } catch (error) {
            console.error('❌ Error ending stream:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async joinStream(streamId: string, sessionToken: string): Promise<void> {
        try {
            await streamsApi.joinViewer(streamId, sessionToken);
        } catch {
            // Non-blocking — viewer count reconciled by cron
        }
    }

    async leaveStream(streamId: string, sessionToken: string): Promise<void> {
        try {
            await streamsApi.leaveViewer(streamId, sessionToken);
        } catch {
            // Non-blocking
        }
    }

    async uploadThumbnail(streamId: string, file: Blob): Promise<void> {
        try {
            await streamsApi.uploadThumbnail(streamId, file);
        } catch (error) {
            // Non-blocking, but surface in devtools — silent failures here
            // mask multer / bucket / RLS issues that are otherwise invisible
            // (no UI for thumbnail upload status).
            console.warn('[Thumbnail] upload failed', error);
        }
    }

    /** Polls the given HLS URL until it returns 200 or the retry budget is exhausted. */
    async checkPlaylistAvailable(hlsUrl: string, maxRetries: number = 10, delay: number = 500): Promise<boolean> {
        const playlistUrl = hlsUrl;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await axios.head(playlistUrl, {
                    timeout: 2000,
                    validateStatus: (status) => status === 200 || status === 404
                });

                if (response.status === 200) {
                    console.log(`✅ Playlist available after ${i + 1} attempt(s)`);
                    return true;
                }

                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch {
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        console.warn(`⚠️ Playlist not available after ${maxRetries} attempts`);
        return false;
    }
}

export const streamViewerService = new StreamViewerService();
