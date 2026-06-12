import type { ReportsFilter } from '@/lib/api/endpoints/moderation';
import type { PageQuery } from '@/lib/api/endpoints/directory';

/** Hierarchical query keys — single source for cross-hook invalidations. */
export const queryKeys = {
  reports: {
    all: ['reports'] as const,
    list: (filter: ReportsFilter) => ['reports', 'list', filter] as const,
    detail: (id: string) => ['reports', 'detail', id] as const,
  },
  bans: {
    all: ['bans'] as const,
    list: (filter: { status?: string; wallet?: string; cursor?: string | null }) =>
      ['bans', 'list', filter] as const,
  },
  reportConfig: ['report-config'] as const,
  players: {
    all: ['players'] as const,
    list: (query: PageQuery) => ['players', 'list', query] as const,
    detail: (wallet: string) => ['players', 'detail', wallet] as const,
  },
  streamers: {
    all: ['streamers'] as const,
    list: (query: PageQuery) => ['streamers', 'list', query] as const,
  },
  adminMatches: ['admin-matches'] as const,
} as const;
