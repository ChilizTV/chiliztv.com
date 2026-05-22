import { apiClient } from '../client';
import type { MarketPoolsDto } from '@chiliztv/shared';

/**
 * Per-PariMatch outcome pool snapshot. The backend multicalls the proxy and
 * caches the result in Redis ~5s. Frontend invalidates via Supabase Realtime
 * on `bets` / `market_events`.
 */
export const marketsApi = {
    getPools: (contractAddress: string): Promise<MarketPoolsDto> =>
        apiClient.get<MarketPoolsDto>(`/matches/${contractAddress.toLowerCase()}/pools`),
};

export type { MarketPoolsDto };
