import { apiClient } from '../client';

export interface JoinWaitlistDTO {
  email: string;
  walletAddress?: string;
}

export const waitlistApi = {
  join: (data: JoinWaitlistDTO): Promise<{ ok: boolean }> =>
    apiClient.post<{ ok: boolean }>('/waitlist', data),
};
