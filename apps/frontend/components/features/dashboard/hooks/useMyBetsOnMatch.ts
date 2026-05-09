'use client';

import { useMemo } from 'react';
import { useMyBets } from './useMyBets';
import { isBetOnHiddenMarket, type MyBet } from '../domain/bets';

interface UseMyBetsOnMatchOptions {
    readonly user: string | undefined;
    readonly contractAddress: string | undefined;
}

interface UseMyBetsOnMatchResult {
    readonly bets: ReadonlyArray<MyBet>;
    readonly isLoading: boolean;
    readonly isError: boolean;
}

/**
 * Filters the dashboard's `useMyBets` feed down to a single match contract.
 * Source of truth = backend /bets endpoint; client-side filter avoids a
 * dedicated API endpoint while bets-per-user stays small.
 */
export function useMyBetsOnMatch({ user, contractAddress }: UseMyBetsOnMatchOptions): UseMyBetsOnMatchResult {
    const query = useMyBets({ user, filter: 'all', limit: 200 });

    const filtered = useMemo(() => {
        if (!query.data?.bets || !contractAddress) return [];
        const target = contractAddress.toLowerCase();
        return query.data.bets.filter(
            (b) => b.contractAddress.toLowerCase() === target && !isBetOnHiddenMarket(b),
        );
    }, [query.data?.bets, contractAddress]);

    return {
        bets: filtered,
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
