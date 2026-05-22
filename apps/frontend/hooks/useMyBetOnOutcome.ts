'use client';

import { useMemo } from 'react';
import type { Address } from 'viem';
import { usePariMatchBaseReadGetUserStake } from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';

const BETTING_CHAIN_ID = chilizConfig.chainId;

interface UseMyBetOnOutcomeArgs {
    readonly contractAddress: Address | undefined;
    readonly marketId: bigint | undefined;
    readonly outcome: bigint | null;
    readonly userAddress: Address | undefined;
    /** Defaults to `true`. Pass `false` to skip the RPC read (e.g. dialog closed). */
    readonly enabled?: boolean;
}

interface UseMyBetOnOutcomeResult {
    readonly existingStake: bigint;
    readonly isLoading: boolean;
}

/**
 * Single-outcome lazy read for the bet dialog's payout preview. When
 * `outcome` is null (user hasn't picked yet) the hook does not fire the RPC.
 * Returns `0n` until the read resolves so the consumer can feed it straight
 * into `parimutuelPayoutPreview({ existingStake })`.
 */
export function useMyBetOnOutcome(args: UseMyBetOnOutcomeArgs): UseMyBetOnOutcomeResult {
    const { contractAddress, marketId, outcome, userAddress, enabled = true } = args;

    const isEnabled =
        enabled
        && !!contractAddress
        && !!userAddress
        && outcome !== null
        && marketId !== undefined;

    const { data, isLoading } = usePariMatchBaseReadGetUserStake({
        address: contractAddress,
        args: isEnabled
            ? [marketId as bigint, userAddress as Address, outcome as bigint]
            : undefined,
        chainId: BETTING_CHAIN_ID,
        query: { enabled: isEnabled },
    });

    return useMemo(
        () => ({
            existingStake: (data as bigint | undefined) ?? BigInt(0),
            isLoading: isEnabled && isLoading,
        }),
        [data, isLoading, isEnabled],
    );
}
