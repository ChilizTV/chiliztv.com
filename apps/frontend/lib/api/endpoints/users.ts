import { apiClient } from '../client';

export interface UserProfileDto {
    walletAddress: string;
    username: string | null;
    avatarUrl: string | null;
    updatedAt: string;
}

interface SingleProfileResponse {
    success: boolean;
    profile: UserProfileDto;
}

interface BatchProfilesResponse {
    success: boolean;
    /** Keyed by lowercase wallet address. Missing wallets are absent. */
    profiles: Record<string, UserProfileDto>;
}

export interface UpsertProfileBody {
    username: string | null;
    avatarUrl?: string | null;
}

/**
 * Wallet → display-profile API. The backend exposes:
 *  - `GET  /users/by-wallet/:address`   — single resolution (404 if unknown)
 *  - `POST /users/by-wallets`           — batch (`{ addresses: string[] }`)
 *  - `POST /users/profile`              — upsert from authenticated Dynamic Labs session
 */
export const usersApi = {
    getByWallet: (address: string): Promise<SingleProfileResponse> =>
        apiClient.get<SingleProfileResponse>(`/users/by-wallet/${address}`),

    getByWallets: (addresses: ReadonlyArray<string>): Promise<BatchProfilesResponse> =>
        apiClient.post<BatchProfilesResponse>('/users/by-wallets', { addresses }),

    upsertProfile: (body: UpsertProfileBody): Promise<SingleProfileResponse> =>
        apiClient.post<SingleProfileResponse>('/users/profile', body),
};
