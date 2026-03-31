import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictionsApi, CreatePredictionDTO } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

/**
 * @notice Hook to fetch user predictions
 * @param userId User ID
 * @return Query result with user predictions
 */
export function useUserPredictions(userId: string) {
  return useQuery({
    queryKey: queryKeys.predictions.byUser(userId),
    queryFn: () => predictionsApi.getByUser(userId),
    enabled: !!userId,
  });
}

/**
 * @notice Hook to fetch user prediction statistics
 * @param userId User ID
 * @return Query result with user stats
 */
export function useUserPredictionStats(userId: string) {
  return useQuery({
    queryKey: queryKeys.predictions.stats(userId),
    queryFn: () => predictionsApi.getUserStats(userId),
    enabled: !!userId,
  });
}

/**
 * @notice Hook to create a new prediction
 * @return Mutation hook for creating predictions
 * @dev Automatically invalidates user predictions and stats on success
 */
export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePredictionDTO) => predictionsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.predictions.byUser(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.predictions.stats(variables.userId),
      });
    },
  });
}
