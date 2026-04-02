import { apiClient } from '../client';
import { BrowseMatchesResponse } from '@/types/browse.types';

export const browseApi = {
  getMatches: async (): Promise<BrowseMatchesResponse> => {
    return await apiClient.get<BrowseMatchesResponse>('/matches/browse');
  },
};
