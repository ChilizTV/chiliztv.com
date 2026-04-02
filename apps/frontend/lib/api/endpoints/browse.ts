import { apiClient } from '../client';
import type { BrowseMatchesResponseDto } from '@chiliztv/shared/dto/matches/BrowseMatchesDto';

export const browseApi = {
  getMatches: async (): Promise<BrowseMatchesResponseDto> => {
    return await apiClient.get<BrowseMatchesResponseDto>('/matches/browse');
  },
};
