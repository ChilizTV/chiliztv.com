'use client';

import { useCallback, useState } from 'react';
import type { Address } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
import { toast } from 'sonner';
import { bettingMatchAbi } from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { describeError } from '@/lib/contracts/errors';
import { isClaimableNow, type ClaimOverlay, type MyBet } from '../domain/bets';
import { useInvalidateMyBets } from './useMyBets';
import { useLocallyClaimed } from './useLocallyClaimed';

/**
 * Group of claimable bets sharing the same `(contractAddress, marketId)`
 * — `claimAll(marketId)` settles them all in a single tx.
 */
interface MarketGroup {
    readonly contractAddress: Address;
    readonly marketId: bigint;
    readonly bets: ReadonlyArray<MyBet>;
}

function groupClaimable(bets: ReadonlyArray<MyBet>, overlay: ClaimOverlay | undefined): MarketGroup[] {
    const map = new Map<string, { contract: Address; marketId: bigint; bets: MyBet[] }>();
    for (const b of bets) {
        if (!isClaimableNow(b, overlay)) continue;
        const key = `${b.contractAddress.toLowerCase()}:${b.marketId}`;
        let group = map.get(key);
        if (!group) {
            group = {
                contract: b.contractAddress as Address,
                marketId: BigInt(b.marketId),
                bets: [],
            };
            map.set(key, group);
        }
        group.bets.push(b);
    }
    return Array.from(map.values()).map((g) => ({
        contractAddress: g.contract,
        marketId: g.marketId,
        bets: g.bets,
    }));
}

export interface UseClaimAllResult {
    /** Fire the batch — sequential `claimAll(marketId)` per group. */
    readonly run: () => Promise<void>;
    /** True while any tx in the batch is mid-flight. */
    readonly busy: boolean;
    /** `n / total` progress while running, otherwise `null`. */
    readonly progress: { readonly done: number; readonly total: number } | null;
}

/**
 * Sequentially claims every claimable winning bet across as many markets
 * as needed. The contract's `claimAll(marketId)` collapses each market's
 * winners into a single tx, but the user can have wins on multiple
 * markets — this hook fires one tx per group, marking the bets locally
 * claimed as soon as each receipt confirms so the UI flips immediately
 * (and stays flipped even if the indexer lags behind).
 *
 * Uses `useWalletClient` + `usePublicClient` directly so we can `await`
 * each receipt before kicking off the next tx — `useWriteContract` is
 * callback-based and harder to chain sequentially.
 */
export function useClaimAll(bets: ReadonlyArray<MyBet>): UseClaimAllResult {
    const { data: walletClient } = useWalletClient({ chainId: chilizConfig.chainId });
    const publicClient = usePublicClient({ chainId: chilizConfig.chainId });
    const { map: overlay, markMany } = useLocallyClaimed();
    const invalidate = useInvalidateMyBets();
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

    const run = useCallback(async () => {
        if (busy) return;
        if (!walletClient || !publicClient) {
            toast.error('Connect a wallet first');
            return;
        }
        const groups = groupClaimable(bets, overlay);
        if (groups.length === 0) {
            toast.info('Nothing to claim');
            return;
        }

        setBusy(true);
        setProgress({ done: 0, total: groups.length });

        let claimedGroups = 0;
        for (let i = 0; i < groups.length; i++) {
            const g = groups[i];
            try {
                const hash = await walletClient.writeContract({
                    abi: bettingMatchAbi,
                    address: g.contractAddress,
                    functionName: 'claimAll',
                    args: [g.marketId],
                });
                await publicClient.waitForTransactionReceipt({ hash });
                // Stamp every bet in the group — keeps the UI consistent
                // even if a partial failure aborts later groups.
                markMany(g.bets, 'claimed', hash);
                claimedGroups++;
            } catch (err) {
                const { decoded } = describeError(err);
                const fn = decoded.severity === 'info'
                    ? toast.info
                    : decoded.severity === 'warning'
                        ? toast.warning
                        : toast.error;
                fn(decoded.title, { description: decoded.description });
                // Stop on first failure — already-claimed groups stay
                // marked so the user can retry without double-prompts.
                break;
            }
            setProgress({ done: i + 1, total: groups.length });
        }

        setBusy(false);
        setProgress(null);

        if (claimedGroups > 0) {
            toast.success(
                claimedGroups === groups.length
                    ? `Claimed ${claimedGroups} ${claimedGroups === 1 ? 'market' : 'markets'}`
                    : `Claimed ${claimedGroups} of ${groups.length} markets`,
            );
            invalidate();
        }
    }, [bets, overlay, busy, walletClient, publicClient, markMany, invalidate]);

    return { run, busy, progress };
}
