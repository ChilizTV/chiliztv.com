import { apiClient } from '../client';
import { Prediction, PredictionStats } from '@/types/api.types';

export interface CreatePredictionDTO {
  userId: string;
  walletAddress: string;
  username: string;
  matchId: number;
  matchName: string;
  predictionType: 'WIN_HOME' | 'WIN_AWAY' | 'DRAW' | 'OVER' | 'UNDER';
  predictionValue: string;
  predictedTeam: string;
  odds: number;
  transactionHash: string;
  matchStartTime: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: {
    limit: number;
    offset: number;
  };
}

/**
 * @notice Prediction API endpoints with type-safe methods
 * @dev All methods use the centralized API client with JWT auth
 */
export const predictionsApi = {
  /**
   * @notice Creates a new prediction
   * @param data Prediction data
   * @return Promise resolving to created prediction
   */
  create: async (data: CreatePredictionDTO): Promise<Prediction> => {
    const response = await apiClient.post<ApiResponse<Prediction>>('/predictions', data);
    return response.data;
  },

  /**
   * @notice Fetches predictions by user ID
   * @param userId User ID
   * @return Promise resolving to array of predictions
   */
  getByUser: async (userId: string): Promise<Prediction[]> => {
    const response = await apiClient.get<PaginatedApiResponse<Prediction[]>>(`/predictions/${userId}`);
    return response.data;
  },

  /**
   * @notice Fetches user prediction statistics
   * @param userId User ID
   * @return Promise resolving to prediction stats
   */
  getUserStats: async (userId: string): Promise<PredictionStats> => {
    const response = await apiClient.get<ApiResponse<PredictionStats>>(`/predictions/stats/${userId}`);
    return response.data;
  },
};
