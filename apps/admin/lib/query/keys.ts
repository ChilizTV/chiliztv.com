import type { ReportsFilter } from '@/lib/api/endpoints/moderation';

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
} as const;
