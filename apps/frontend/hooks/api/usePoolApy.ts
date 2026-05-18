'use client';

import { useQuery } from '@tanstack/react-query';
import { poolApi, type PoolApyResponseDto } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { ApySnapshotDto } from '@chiliztv/shared';

const STALE_MS = 60_000;
const REFETCH_MS = 5 * 60_000;

/**
 * Backend serves `/pool/apy` from `pool_apy_snapshots`; ComputeApyJob refreshes
 * every 15 min, controller adds a 5-min browser cache.
 */
export function usePoolApy() {
    return useQuery<PoolApyResponseDto>({
        queryKey: queryKeys.pool.apy(),
        queryFn: () => poolApi.getApy(),
        staleTime: STALE_MS,
        refetchInterval: REFETCH_MS,
        refetchOnWindowFocus: false,
    });
}

/** "12.34%" or "—" when missing / insufficient history. */
export function formatApy(snapshot: ApySnapshotDto | null | undefined): string {
    if (!snapshot) return '—';
    return `${(snapshot.apyBps / 100).toFixed(2)}%`;
}

export type { ApySnapshotDto };
