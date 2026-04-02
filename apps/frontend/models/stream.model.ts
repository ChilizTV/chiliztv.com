export type { StreamResponseDto as LiveStream } from '@chiliztv/shared/dto/streams/StreamResponseDto';
export type { CreateStreamDto as CreateStreamRequest } from '@chiliztv/shared/dto/streams/CreateStreamDto';

export interface CreateStreamResponse {
    success: boolean;
    stream?: import('@chiliztv/shared/dto/streams/StreamResponseDto').StreamResponseDto;
    error?: string;
}

export interface StreamListResponse {
    success: boolean;
    streams: import('@chiliztv/shared/dto/streams/StreamResponseDto').StreamResponseDto[];
    error?: string;
}
