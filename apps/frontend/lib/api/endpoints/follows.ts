import type { InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '../client';

export interface FollowDto {
  id: string;
  followerId: string;
  streamerId: string;
  streamerName: string;
  createdAt: string;
}

interface FollowResponse { success: boolean; follow: FollowDto }
interface UnfollowResponse { success: boolean; message: string }
interface IsFollowingResponse { success: boolean; isFollowing: boolean }
interface FollowerCountResponse { success: boolean; count: number }
interface FollowedStreamersResponse { success: boolean; follows: FollowDto[] }

export const followsApi = {
  follow: async (followerId: string, streamerId: string, streamerName: string): Promise<FollowResponse> => {
    return await apiClient.post<FollowResponse>('/follows', { followerId, streamerId, streamerName });
  },

  unfollow: async (followerId: string, streamerId: string): Promise<UnfollowResponse> => {
    return await apiClient.delete<UnfollowResponse>('/follows', {
      data: { followerId, streamerId },
    } as InternalAxiosRequestConfig);
  },

  isFollowing: async (followerId: string, streamerId: string): Promise<IsFollowingResponse> => {
    return await apiClient.get<IsFollowingResponse>(
      `/follows/is-following?followerId=${encodeURIComponent(followerId)}&streamerId=${encodeURIComponent(streamerId)}`
    );
  },

  getFollowerCount: async (streamerId: string): Promise<FollowerCountResponse> => {
    return await apiClient.get<FollowerCountResponse>(`/follows/count/${encodeURIComponent(streamerId)}`);
  },

  getFollowedStreamers: async (followerId: string): Promise<FollowedStreamersResponse> => {
    return await apiClient.get<FollowedStreamersResponse>(`/follows/following/${encodeURIComponent(followerId)}`);
  },
};
