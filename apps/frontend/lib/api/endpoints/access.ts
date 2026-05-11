import { apiClient } from '../client';

export const accessApi = {
  redeem: (code: string): Promise<{ success: boolean }> =>
    apiClient.post<{ success: boolean }>('/access/redeem', { code }),

  me: (): Promise<{ granted: boolean }> =>
    apiClient.get<{ granted: boolean }>('/access/me'),

  logout: (): Promise<{ success: boolean }> =>
    apiClient.post<{ success: boolean }>('/access/logout', {}),
};
