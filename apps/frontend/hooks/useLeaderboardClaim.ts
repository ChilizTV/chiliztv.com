'use client';

import { useEffect, useState } from 'react';
import type { Address, Hex } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';
import {
    useLeaderboardRewardsSimulateClaim,
    useLeaderboardRewardsWriteClaim,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { queryKeys } from '@/lib/query/keys';
import { describeError } from '@/lib/contracts/errors';

export type ClaimDisabledReason =
    | 'expired'
    | 'already-claimed'
    | 'invalid-proof'
    | 'simulating'
    | 'pending'
    | 'confirming'
    | 'no-wallet';

interface UseLeaderboardClaimArgs {
    readonly wallet: Address | undefined;
    readonly epochId: number;
    readonly amount: bigint;
    readonly proof: ReadonlyArray<Hex>;
    /** ISO timestamp of `claimExpiry` — checked client-side before simulation. */
    readonly claimExpiry: string;
    /** Server-known claim flag — short-circuits the on-chain simulate. */
    readonly alreadyClaimed: boolean;
}

export interface UseLeaderboardClaimResult {
    readonly canClaim: boolean;
    readonly reason: ClaimDisabledReason | null;
    readonly claim: () => void;
    readonly txHash: Hex | undefined;
    readonly isConfirming: boolean;
    readonly isConfirmed: boolean;
}

/**
 * Pre-flight via `useSimulateContract` so the bouton stays disabled when the
 * tx would revert (expired window, invalid proof, already claimed). Adds
 * client-side expiry guard so a stale tab can't even submit, and an
 * anti-double-submit guard while `isPending` / `isConfirming`.
 */
export function useLeaderboardClaim(args: UseLeaderboardClaimArgs): UseLeaderboardClaimResult {
    const { wallet, epochId, amount, proof, claimExpiry, alreadyClaimed } = args;
    const qc = useQueryClient();

    const now = Date.now();
    const expired = new Date(claimExpiry).getTime() <= now;

    const simulationEnabled = !!wallet && !expired && !alreadyClaimed;
    const simulation = useLeaderboardRewardsSimulateClaim({
        address: chilizConfig.leaderboardRewards,
        chainId: chilizConfig.chainId,
        args: simulationEnabled
            ? [BigInt(epochId), amount, proof as Hex[]]
            : undefined,
        account: wallet,
        query: { enabled: simulationEnabled },
    });

    const { writeContract, data: txHash, isPending, error: writeError } =
        useLeaderboardRewardsWriteClaim();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    useEffect(() => {
        if (writeError) {
            const { decoded } = describeError(writeError);
            const fn = decoded.severity === 'info'
                ? toast.info
                : decoded.severity === 'warning'
                    ? toast.warning
                    : toast.error;
            fn(decoded.title, { description: decoded.description });
        }
    }, [writeError]);

    const [invalidated, setInvalidated] = useState(false);
    useEffect(() => {
        if (isConfirmed && !invalidated && wallet) {
            setInvalidated(true);
            toast.success('Prize claimed', {
                description: txHash ? `${txHash.slice(0, 10)}…${txHash.slice(-8)}` : undefined,
            });
            void qc.invalidateQueries({ queryKey: queryKeys.leaderboard.claimable(wallet) });
            void qc.invalidateQueries({ queryKey: queryKeys.leaderboard.me(wallet) });
        }
    }, [isConfirmed, invalidated, wallet, qc, txHash]);

    let reason: ClaimDisabledReason | null = null;
    if (!wallet) reason = 'no-wallet';
    else if (expired) reason = 'expired';
    else if (alreadyClaimed) reason = 'already-claimed';
    else if (isPending) reason = 'pending';
    else if (isConfirming) reason = 'confirming';
    else if (simulation.isLoading) reason = 'simulating';
    else if (simulation.error) reason = 'invalid-proof';

    const canClaim = reason === null && !!simulation.data?.request;

    const claim = () => {
        if (!canClaim || !simulation.data) return;
        writeContract(simulation.data.request);
    };

    return { canClaim, reason, claim, txHash, isConfirming, isConfirmed };
}
