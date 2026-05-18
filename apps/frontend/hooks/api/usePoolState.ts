'use client';

import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { poolApi, type PoolStateResponseDto } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

/**
 * Decoded pool state. The transport encodes bigints as decimal strings (no
 * native bigint over JSON); this view converts them back so callers get the
 * native type and don't have to remember which fields need `BigInt(...)`.
 */
export interface PoolStateView {
    readonly totalAssets: bigint;
    readonly totalSupply: bigint;
    readonly freeBalance: bigint;
    readonly totalLiabilities: bigint;
    readonly utilization: bigint;
    readonly protocolFeeBps: number;
    readonly treasuryShareBps: number;
    readonly lpWithdrawalFeeBps: number;
    readonly maxBetAmount: bigint;
    readonly maxLiabilityPerMarketBps: number;
    readonly maxLiabilityPerMatchBps: number;
    readonly depositCooldownSeconds: number;
    readonly paused: boolean;
    readonly accruedTreasury: bigint;
    readonly treasury: Address;
    readonly pendingTreasury: Address;
    readonly timestamp: number;
}

function decode(dto: PoolStateResponseDto): PoolStateView {
    return {
        totalAssets: BigInt(dto.state.totalAssets),
        totalSupply: BigInt(dto.state.totalSupply),
        freeBalance: BigInt(dto.state.freeBalance),
        totalLiabilities: BigInt(dto.state.totalLiabilities),
        utilization: BigInt(dto.state.utilization),
        protocolFeeBps: dto.state.protocolFeeBps,
        treasuryShareBps: dto.state.treasuryShareBps,
        lpWithdrawalFeeBps: dto.state.lpWithdrawalFeeBps,
        maxBetAmount: BigInt(dto.state.maxBetAmount),
        maxLiabilityPerMarketBps: dto.state.maxLiabilityPerMarketBps,
        maxLiabilityPerMatchBps: dto.state.maxLiabilityPerMatchBps,
        depositCooldownSeconds: dto.state.depositCooldownSeconds,
        paused: dto.state.paused,
        accruedTreasury: BigInt(dto.state.accruedTreasury),
        treasury: dto.state.treasury as Address,
        pendingTreasury: dto.state.pendingTreasury as Address,
        timestamp: dto.timestamp,
    };
}

const STALE_MS = 15_000;
const REFETCH_MS = 30_000;

/**
 * React Query wrapper around `/pool/state`. The backend serves a 15 s cache
 * (jitter ±20 %) on top of one batched viem read of the liquidity pool, so a
 * 15 s `staleTime` aligns: the front polls every 30 s, the backend absorbs
 * the fan-out across viewers. Replaces ~16 direct viem reads per client —
 * the gain on the Chiliz public RPC quota (≈50 req/s plafond) scales with
 * the number of concurrent dashboard sessions.
 */
export function usePoolState() {
    return useQuery<PoolStateView>({
        queryKey: queryKeys.pool.state(),
        queryFn: async () => decode(await poolApi.getState()),
        staleTime: STALE_MS,
        refetchInterval: REFETCH_MS,
        refetchOnWindowFocus: false,
    });
}
