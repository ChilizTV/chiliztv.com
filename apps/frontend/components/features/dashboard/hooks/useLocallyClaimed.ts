'use client';

import { useSyncExternalStore } from 'react';
import { claimedBetsStore, localClaimKey, type LocalClaimEntry, type LocalClaimKind } from '../domain/locallyClaimedStore';
import type { MyBet } from '../domain/bets';

/**
 * Subscribes to the locally-claimed pub/sub store. Returns the current
 * map and a `lookup(bet)` helper that gives the optimistic claim entry
 * (or `undefined`) for a given bet.
 */
export function useLocallyClaimed(): {
    readonly map: ReadonlyMap<string, LocalClaimEntry>;
    readonly lookup: (bet: Pick<MyBet, 'contractAddress' | 'marketId' | 'betIndex'>) => LocalClaimEntry | undefined;
    readonly mark: (bet: Pick<MyBet, 'contractAddress' | 'marketId' | 'betIndex'>, kind: LocalClaimKind, txHash?: string) => void;
    readonly markMany: (bets: ReadonlyArray<Pick<MyBet, 'contractAddress' | 'marketId' | 'betIndex'>>, kind: LocalClaimKind, txHash?: string) => void;
} {
    const map = useSyncExternalStore(
        claimedBetsStore.subscribe,
        claimedBetsStore.getSnapshot,
        claimedBetsStore.getServerSnapshot,
    );

    return {
        map,
        lookup: (bet) => map.get(localClaimKey(bet)),
        mark: (bet, kind, txHash) => claimedBetsStore.mark(localClaimKey(bet), kind, txHash),
        markMany: (bets, kind, txHash) =>
            claimedBetsStore.markMany(
                bets.map((b) => localClaimKey(b)),
                kind,
                txHash,
            ),
    };
}
