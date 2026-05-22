/**
 * Hook for admin actions on PariMatchFactory contract.
 * Used to create new match contracts (Football or Basketball PariMatch proxies).
 */

import { useCallback } from 'react';
import {
    usePariMatchFactoryWriteCreateFootballMatch,
    usePariMatchFactoryWriteCreateBasketballMatch,
    usePariMatchFactoryReadGetAllMatches,
    usePariMatchFactoryReadGetSportType,
} from '@/lib/contracts/generated';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';

// Pin contract reads to Chiliz Spicy testnet so they don't depend on the
// connected wallet's active chain.
const BETTING_CHAIN_ID = 88882 as const;

interface MatchCreationState {
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    error: Error | null;
    txHash?: `0x${string}`;
    matchAddress?: Address;
}

export interface UsePariMatchFactoryReturn {
    createFootballMatch: (matchName: string, owner: Address, oracle: Address) => void;
    createBasketballMatch: (matchName: string, owner: Address, oracle: Address) => void;
    allMatches: readonly Address[] | undefined;
    getSportType: (matchAddress: Address) => number | undefined;
    footballCreation: MatchCreationState;
    basketballCreation: MatchCreationState;
    isLoadingMatches: boolean;
    isRefetchingMatches: boolean;
    refetchMatches: () => void;
}

export function usePariMatchFactory(factoryAddress: Address): UsePariMatchFactoryReturn {
    const {
        writeContract: writeCreateFootballMatch,
        data: footballTxHash,
        isPending: isFootballPending,
        error: footballWriteError,
    } = usePariMatchFactoryWriteCreateFootballMatch();

    const {
        isLoading: isFootballConfirming,
        isSuccess: isFootballSuccess,
        data: footballReceipt,
    } = useWaitForTransactionReceipt({ hash: footballTxHash });

    const {
        writeContract: writeCreateBasketballMatch,
        data: basketballTxHash,
        isPending: isBasketballPending,
        error: basketballWriteError,
    } = usePariMatchFactoryWriteCreateBasketballMatch();

    const {
        isLoading: isBasketballConfirming,
        isSuccess: isBasketballSuccess,
        data: basketballReceipt,
    } = useWaitForTransactionReceipt({ hash: basketballTxHash });

    const {
        data: allMatches,
        isLoading: isLoadingMatches,
        isRefetching: isRefetchingMatches,
        refetch: refetchMatches,
    } = usePariMatchFactoryReadGetAllMatches({
        address: factoryAddress,
        chainId: BETTING_CHAIN_ID,
    });

    const { data: sportTypeData } = usePariMatchFactoryReadGetSportType({
        address: factoryAddress,
        args: allMatches && allMatches.length > 0 ? [allMatches[0]] : undefined,
        chainId: BETTING_CHAIN_ID,
    });

    const createFootballMatch = useCallback(
        (matchName: string, owner: Address, oracle: Address) => {
            if (!writeCreateFootballMatch) return;
            writeCreateFootballMatch({
                address: factoryAddress,
                args: [matchName, owner, oracle],
            });
        },
        [writeCreateFootballMatch, factoryAddress],
    );

    const createBasketballMatch = useCallback(
        (matchName: string, owner: Address, oracle: Address) => {
            if (!writeCreateBasketballMatch) return;
            writeCreateBasketballMatch({
                address: factoryAddress,
                args: [matchName, owner, oracle],
            });
        },
        [writeCreateBasketballMatch, factoryAddress],
    );

    const getSportType = useCallback(
        (_matchAddress: Address): number | undefined => {
            // Single-call snapshot — refetch with a per-match read if the UI
            // needs per-row sport types.
            return sportTypeData as number | undefined;
        },
        [sportTypeData],
    );

    return {
        createFootballMatch,
        createBasketballMatch,
        allMatches,
        getSportType,
        footballCreation: {
            isPending: isFootballPending,
            isConfirming: isFootballConfirming,
            isSuccess: isFootballSuccess,
            error: footballWriteError,
            txHash: footballTxHash,
            matchAddress: footballReceipt?.logs?.[0]?.address as Address | undefined,
        },
        basketballCreation: {
            isPending: isBasketballPending,
            isConfirming: isBasketballConfirming,
            isSuccess: isBasketballSuccess,
            error: basketballWriteError,
            txHash: basketballTxHash,
            matchAddress: basketballReceipt?.logs?.[0]?.address as Address | undefined,
        },
        isLoadingMatches,
        isRefetchingMatches,
        refetchMatches,
    };
}
