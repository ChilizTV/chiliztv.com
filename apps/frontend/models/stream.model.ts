export interface LiveStream {
    id: string;
    matchId: number;
    streamerId: string;
    streamerName: string;
    streamerWalletAddress?: string;
    streamKey: string;
    hlsPlaylistUrl?: string;
    title?: string;
    status: 'created' | 'live' | 'ended';
    viewerCount: number;
    createdAt: string;
    endedAt?: string;
}

export interface CreateStreamRequest {
    matchId: number;
    streamerId: string;
    streamerName: string;
    streamerWalletAddress?: string;
    title?: string;
}

export interface CreateStreamResponse {
    success: boolean;
    stream?: LiveStream;
    error?: string;
}

export interface StreamListResponse {
    success: boolean;
    streams: LiveStream[];
    error?: string;
}

