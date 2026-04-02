import { apiClient } from '../client';
import { LiveStream, CreateStreamRequest } from '@/models/stream.model';

interface StreamListResponse {
  success: boolean;
  streams: LiveStream[];
  count: number;
}

interface CreateStreamResponse {
  success: boolean;
  stream?: LiveStream;
  error?: string;
}

interface EndStreamResponse {
  success: boolean;
  message?: string;
}

interface PreferredStreamResponse {
  success: boolean;
  stream: LiveStream | null;
  source: 'followed' | 'top_viewer' | 'none';
}

/**
 * @notice Stream API endpoints with type-safe methods
 * @dev All methods use the centralized API client with JWT auth
 */
export const streamsApi = {
  /**
   * @notice Fetches active streams for a match
   * @param matchId The match ID to get streams for
   */
  getActive: async (matchId: number): Promise<StreamListResponse> => {
    return apiClient.get<StreamListResponse>('/stream', { params: { matchId } } as never);
  },

  /**
   * @notice Fetches the preferred stream for a user (follow-aware)
   * @param matchId The match ID
   * @param userId Optional user ID for follow-based prioritization
   */
  getPreferred: async (
    matchId: number,
    userId?: string
  ): Promise<{ stream: LiveStream | null; source: 'followed' | 'top_viewer' | 'none' }> => {
    const params: Record<string, unknown> = { matchId };
    if (userId) params.userId = userId;
    const response = await apiClient.get<PreferredStreamResponse>('/stream/preferred', { params } as never);
    return { stream: response.stream, source: response.source };
  },

  /**
   * @notice Creates a new stream
   */
  create: async (request: CreateStreamRequest): Promise<CreateStreamResponse> => {
    return apiClient.post<CreateStreamResponse>('/stream', request);
  },

  /**
   * @notice Ends/deletes a stream
   */
  end: async (streamId: string, streamerId: string): Promise<EndStreamResponse> => {
    return apiClient.delete<EndStreamResponse>('/stream', { data: { streamId, streamerId } } as never);
  },

  /**
   * @notice Registers a viewer session joining a stream
   */
  joinViewer: async (streamId: string, sessionToken: string): Promise<void> => {
    await apiClient.post(`/stream/${streamId}/join`, { sessionToken });
  },

  /**
   * @notice Registers a viewer session leaving a stream
   */
  leaveViewer: async (streamId: string, sessionToken: string): Promise<void> => {
    await apiClient.post(`/stream/${streamId}/leave`, { sessionToken });
  },

  /**
   * @notice Uploads a stream thumbnail
   */
  uploadThumbnail: async (streamId: string, file: Blob): Promise<void> => {
    const form = new FormData();
    form.append('file', file, 'thumbnail.jpg');
    await apiClient.put(`/stream/${streamId}/thumbnail`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    } as never);
  },
};
