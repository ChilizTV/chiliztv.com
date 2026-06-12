import { apiClient } from '../client';
import type { AdminRole } from '@/lib/roles';

export interface AdminSession {
  wallet: string;
  role: AdminRole;
}

export const adminApi = {
  gate: (code: string) =>
    apiClient.post<{ success: boolean; data: { gateToken: string; disabled?: boolean } }>('/admin/gate', { code }),
  challenge: (walletAddress: string) =>
    apiClient.post<{ success: boolean; data: { message: string } }>('/admin/auth/challenge', { walletAddress }),
  verify: (walletAddress: string, signature: string) =>
    apiClient.post<{ success: boolean; token: string }>('/admin/auth/verify', { walletAddress, signature }),
  me: () => apiClient.get<{ success: boolean; data: AdminSession }>('/admin/me'),
};
