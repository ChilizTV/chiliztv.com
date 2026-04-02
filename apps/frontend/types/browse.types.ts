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
