import { apiClient } from '../client';
import type { PoolStateResponseDto, PoolApyResponseDto } from '@chiliztv/shared';

/**
 * Backend-cached pool endpoints. The state response replaces ~16 direct viem
 * reads against the Chiliz public RPC; the apy response is fed by the
 * ComputeApyJob (15 min cadence) and cached 5 min by the controller.
 */
export const poolApi = {
    getState: (): Promise<PoolStateResponseDto> =>
        apiClient.get<PoolStateResponseDto>('/pool/state'),
    getApy: (): Promise<PoolApyResponseDto> =>
        apiClient.get<PoolApyResponseDto>('/pool/apy'),
};

export type { PoolStateResponseDto, PoolApyResponseDto };
