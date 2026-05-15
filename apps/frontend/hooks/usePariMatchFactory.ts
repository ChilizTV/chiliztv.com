'use client';

import { type Address } from 'viem';
import {
  usePariMatchFactoryReadGetAllMatches,
  usePariMatchFactoryReadGetSportType,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';

export type PariSport = 'FOOTBALL' | 'BASKETBALL' | 'UNKNOWN';

/**
 * Helpers around the on-chain PariMatchFactory.
 *
 * `getAllMatches()` returns every match proxy the factory ever deployed, in
 * order. `getSportType(matchAddress)` returns 0 (FOOTBALL) or 1 (BASKETBALL).
 *
 * The /live/999999 test convention takes `allMatches.at(-1)` — the most
 * recently deployed proxy — so a fresh deployment is always reachable without
 * passing addresses through URLs.
 */
export function usePariMatchFactory(params: {
  matchAddress?: Address;
  enabled?: boolean;
} = {}) {
  const { matchAddress, enabled = true } = params;

  const {
    data: allMatchesRaw,
    isLoading: loadingMatches,
    error: matchesError,
    refetch,
  } = usePariMatchFactoryReadGetAllMatches({
    address: chilizConfig.pariMatchFactory,
    chainId: chilizConfig.chainId,
    // Poll so a newly-created match shows up in the admin list and on
    // /live/999999 within a few seconds, even without a manual refresh.
    query: { enabled, refetchInterval: 5_000 },
  });

  const allMatches = (allMatchesRaw as readonly Address[] | undefined) ?? undefined;

  const { data: sportTypeRaw } = usePariMatchFactoryReadGetSportType({
    address: chilizConfig.pariMatchFactory,
    chainId: chilizConfig.chainId,
    args: matchAddress ? [matchAddress] : undefined,
    query: { enabled: enabled && !!matchAddress },
  });

  const sportType: PariSport = sportLabel(sportTypeRaw);

  return {
    factoryAddress: chilizConfig.pariMatchFactory,
    allMatches,
    latestMatch: allMatches?.at(-1),
    sportType,
    loadingMatches,
    matchesError,
    refetch,
  };
}

function sportLabel(raw: unknown): PariSport {
  const n = typeof raw === 'bigint' ? Number(raw) : raw;
  if (n === 0) return 'FOOTBALL';
  if (n === 1) return 'BASKETBALL';
  return 'UNKNOWN';
}
