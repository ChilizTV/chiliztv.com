export interface StreamPreview {
  streamId: string;
  streamerName: string;
  thumbnailUrl: string | null;
  viewers: number;
}

export interface BrowseMatch {
  id: number;
  homeTeam: { name: string; logoUrl: string | null };
  awayTeam: { name: string; logoUrl: string | null };
  kickoffAt: string;
  status: string;
  score: { home: number; away: number } | null;
  odds: { home: number | null; draw: number | null; away: number | null } | null;
  streamsPreview: StreamPreview[];
}

export interface BrowseLeague {
  league: {
    id: number;
    name: string;
    logoUrl: string | null;
    country: string | null;
  };
  matches: BrowseMatch[];
}

export interface BrowseMatchesResponse {
  success: boolean;
  leagues: BrowseLeague[];
}

export type SortOrder = 'asc' | 'desc';

/**
 * 'league_*' : grouped by league, matches sorted by kickoff within each section
 * 'time_*'   : flat global list, no league grouping
 */
export type SortMode =
  | 'league_asc'
  | 'league_desc'
  | 'time_asc'
  | 'time_desc';
