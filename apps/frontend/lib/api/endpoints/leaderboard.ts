import { apiClient } from '../client';
import type {
    LeaderboardTopDto,
    MyLeaderboardPositionDto,
    MyClaimableEpochsDto,
} from '@chiliztv/shared';

/** REST surface for `/leaderboard/*` (4-layer canonical pattern §3.2bis). */
export const leaderboardApi = {
    getTop: (limit = 100): Promise<LeaderboardTopDto> =>
        apiClient.get<LeaderboardTopDto>(`/leaderboard/top?limit=${limit}`),

    getMyPosition: (wallet: string): Promise<MyLeaderboardPositionDto> =>
        apiClient.get<MyLeaderboardPositionDto>(`/leaderboard/me/${wallet.toLowerCase()}`),

    getMyClaimable: (wallet: string): Promise<MyClaimableEpochsDto> =>
        apiClient.get<MyClaimableEpochsDto>(`/leaderboard/me/${wallet.toLowerCase()}/claimable`),
};

export type { LeaderboardTopDto, MyLeaderboardPositionDto, MyClaimableEpochsDto };
