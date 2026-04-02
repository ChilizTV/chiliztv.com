import { BrowseLeague, BrowseMatch, SortMode } from '@/types/browse.types';

/**
 * @returns A comparator that sorts BrowseMatch by kickoffAt in the given order.
 */
function byKickoff(order: 'asc' | 'desc') {
  const sign = order === 'asc' ? 1 : -1;
  return (a: BrowseMatch, b: BrowseMatch): number =>
    sign * (new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
}

/**
 * Pure function — no side effects, fully unit-testable.
 *
 * - 'league_asc' / 'league_desc': preserves league grouping, sorts matches by kickoff within each section.
 * - 'time_asc' / 'time_desc': flattens all matches into a single synthetic league (id: 0),
 *   sorted globally by kickoff. LeagueSection detects id === 0 to hide the header.
 *
 * @param leagues - Source leagues (already filtered)
 * @param mode    - Active sort mode
 * @returns A new BrowseLeague[] — input is never mutated.
 */
export function applySort(leagues: BrowseLeague[], mode: SortMode): BrowseLeague[] {
  switch (mode) {
    case 'league_asc':
      return leagues.map(l => ({ ...l, matches: [...l.matches].sort(byKickoff('asc')) }));

    case 'league_desc':
      return leagues.map(l => ({ ...l, matches: [...l.matches].sort(byKickoff('desc')) }));

    case 'time_asc': {
      const all = leagues.flatMap(l => l.matches).sort(byKickoff('asc'));
      return [{ league: { id: 0, name: 'All Matches', logoUrl: null, country: null }, matches: all }];
    }

    case 'time_desc': {
      const all = leagues.flatMap(l => l.matches).sort(byKickoff('desc'));
      return [{ league: { id: 0, name: 'All Matches', logoUrl: null, country: null }, matches: all }];
    }
  }
}
