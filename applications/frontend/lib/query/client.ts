import { QueryClient } from '@tanstack/react-query';

/**
 * @notice React Query client with optimized defaults for caching and retries
 * @dev Configures 5min stale time, 10min garbage collection, smart retry logic
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        const axiosError = error as { response?: { status?: number } };
        const status = axiosError?.response?.status;

        if (status && status >= 400 && status < 500) {
          return false;
        }

        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    },
    mutations: {
      retry: false,
    },
  },
});
