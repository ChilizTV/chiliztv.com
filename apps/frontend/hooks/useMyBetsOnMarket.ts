'use client';

import { useMemo } from 'react';
import type { Address } from 'viem';
import { useReadContracts } from 'wagmi';
import { pariMatchBaseAbi } from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { deriveClaimKind, MarketState, type ClaimKind } from './useDeriveClaimKind';

const BETTING_CHAIN_ID = chilizConfig.chainId;

interface UseMyBetsOnMarketArgs {
    readonly contractAddress: Address | undefined;
    readonly marketId: bigint | undefined;
    /** Inclusive max outcome from `MarketSpec.maxOutcome` — number of stakes reads = maxOutcome + 1. */
    readonly outcomeCount: number;
    readonly userAddress: Address | undefined;
    readonly enabled?: boolean;
}

interface UseMyBetsOnMarketResult {
    readonly stakesByOutcome: ReadonlyMap<bigint, bigint>;
    readonly totalStake: bigint;
    readonly hasClaimed: boolean;
    readonly claimKind: ClaimKind;
    readonly state: number;
    readonly isLoading: boolean;
}

/**
 * Multi-outcome multicall read for the per-match positions panel. Reads
 * every `getUserStake(marketId, user, outcome)` for outcome ∈ [0, outcomeCount[
 * plus `getUserTotalStake`, `hasClaimed`, and `getMarketCore` in one
 * `useReadContracts` round-trip.
 *
 * Skips the RPC entirely when any required arg is missing.
 */
export function useMyBetsOnMarket(args: UseMyBetsOnMarketArgs): UseMyBetsOnMarketResult {
    const { contractAddress, marketId, outcomeCount, userAddress, enabled = true } = args;

    const isEnabled =
        enabled
        && !!contractAddress
        && marketId !== undefined
        && !!userAddress
        && outcomeCount > 0;

    const contracts = useMemo(() => {
        if (!isEnabled) return [];
        const stakeReads = Array.from({ length: outcomeCount }, (_v, idx) => ({
            address: contractAddress as Address,
            abi: pariMatchBaseAbi,
            functionName: 'getUserStake' as const,
            args: [marketId as bigint, userAddress as Address, BigInt(idx)] as const,
            chainId: BETTING_CHAIN_ID,
        }));
        return [
            ...stakeReads,
            {
                address: contractAddress as Address,
                abi: pariMatchBaseAbi,
                functionName: 'getUserTotalStake' as const,
                args: [marketId as bigint, userAddress as Address] as const,
                chainId: BETTING_CHAIN_ID,
            },
            {
                address: contractAddress as Address,
                abi: pariMatchBaseAbi,
                functionName: 'hasClaimed' as const,
                args: [marketId as bigint, userAddress as Address] as const,
                chainId: BETTING_CHAIN_ID,
            },
            {
                address: contractAddress as Address,
                abi: pariMatchBaseAbi,
                functionName: 'getMarketCore' as const,
                args: [marketId as bigint] as const,
                chainId: BETTING_CHAIN_ID,
            },
        ];
    }, [isEnabled, contractAddress, marketId, outcomeCount, userAddress]);

    const { data, isLoading } = useReadContracts({
        contracts,
        allowFailure: true,
        query: { enabled: isEnabled },
    });

    return useMemo(() => {
        if (!data || data.length === 0) {
            return {
                stakesByOutcome: new Map<bigint, bigint>(),
                totalStake: BigInt(0),
                hasClaimed: false,
                claimKind: 'none' as ClaimKind,
                state: MarketState.Inactive,
                isLoading: isEnabled && isLoading,
            };
        }

        const stakesByOutcome = new Map<bigint, bigint>();
        for (let idx = 0; idx < outcomeCount; idx++) {
            const entry = data[idx];
            const raw = entry?.status === 'success' ? (entry.result as bigint | undefined) : undefined;
            stakesByOutcome.set(BigInt(idx), raw ?? BigInt(0));
        }

        const totalEntry = data[outcomeCount];
        const hasClaimedEntry = data[outcomeCount + 1];
        const coreEntry = data[outcomeCount + 2];

        const totalStake = totalEntry?.status === 'success' ? (totalEntry.result as bigint) : BigInt(0);
        const hasClaimed = hasClaimedEntry?.status === 'success' ? (hasClaimedEntry.result as boolean) : false;
        const core = coreEntry?.status === 'success'
            ? (coreEntry.result as { state: number })
            : { state: MarketState.Inactive };
        const claimKind = deriveClaimKind(core.state, hasClaimed);

        return {
            stakesByOutcome,
            totalStake,
            hasClaimed,
            claimKind,
            state: core.state,
            isLoading: false,
        };
    }, [data, isLoading, isEnabled, outcomeCount]);
}
