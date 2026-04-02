import { apiPost, apiGet } from '../client';
import type { PredictionResponseDto } from '@chiliztv/shared/dto/predictions/PredictionResponseDto';
import type { UserPredictionStats } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';
import type { CreatePredictionDto } from '@chiliztv/shared/dto/predictions/CreatePredictionDto';

/**
 * Re-exported under the old name so existing consumers (usePredictions.ts etc.)
 * continue to work without changes.
 */
export type { CreatePredictionDto as CreatePredictionDTO };

/**
 * @notice Prediction API endpoints with type-safe methods
 * @dev All methods use apiPost/apiGet which apply normalizeFormatB automatically,
 *      since prediction endpoints return Format B: { success: true, data: T }.
 */
export const predictionsApi = {
  /**
   * @notice Creates a new prediction
   * @param data Prediction data
   * @return Promise resolving to created prediction
   */
  create: async (data: CreatePredictionDto): Promise<PredictionResponseDto> => {
    return apiPost<PredictionResponseDto>('/predictions', data);
  },

  /**
   * @notice Fetches predictions by user ID
   * @param userId User ID
   * @return Promise resolving to array of predictions
   */
  getByUser: async (userId: string): Promise<PredictionResponseDto[]> => {
    return apiGet<PredictionResponseDto[]>(`/predictions/${userId}`);
  },

  /**
   * @notice Fetches user prediction statistics
   * @param userId User ID
   * @return Promise resolving to prediction stats
   */
  getUserStats: async (userId: string): Promise<UserPredictionStats> => {
    return apiGet<UserPredictionStats>(`/predictions/stats/${userId}`);
  },
};
