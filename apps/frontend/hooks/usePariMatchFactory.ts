/**
 * Hook for admin actions on BettingMatchFactory contract
 * Used to create new match contracts (Football or Basketball)
 */

import { useCallback } from 'react';
import { 
  useBettingMatchFactoryWriteCreateFootballMatch,
  useBettingMatchFactoryWriteCreateBasketballMatch,
  useBettingMatchFactoryReadGetAllMatches,
  useBettingMatchFactoryReadGetSportType
} from '@/lib/contracts/generated';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';

// Pin contract reads to Chiliz Spicy testnet so they don't depend on the
// connected wallet's active chain (otherwise the request never fires).
const BETTING_CHAIN_ID = 88882 as const;

interface MatchCreationState {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash?: `0x${string}`;
  matchAddress?: Address;
}

export interface UseBettingMatchFactoryReturn {
  // Write functions
  createFootballMatch: (matchName: string, owner: Address, oracle: Address) => void;
  createBasketballMatch: (matchName: string, owner: Address, oracle: Address) => void;

  // Read functions
  allMatches: readonly Address[] | undefined;
  getSportType: (matchAddress: Address) => number | undefined;
  
  // States
  footballCreation: MatchCreationState;
  basketballCreation: MatchCreationState;

  // Loading states
  isLoadingMatches: boolean;
  isRefetchingMatches: boolean;
  
  // Refetch function
  refetchMatches: () => void;
}

export function useBettingMatchFactory(factoryAddress: Address): UseBettingMatchFactoryReturn {
  
  // ============================================
  // Write Hooks - Football Match Creation
  // ============================================
  const {
    writeContract: writeCreateFootballMatch,
    data: footballTxHash,
    isPending: isFootballPending,
    error: footballWriteError,
  } = useBettingMatchFactoryWriteCreateFootballMatch();

  const {
    isLoading: isFootballConfirming,
    isSuccess: isFootballSuccess,
    data: footballReceipt,
  } = useWaitForTransactionReceipt({
    hash: footballTxHash,
  });

  // ============================================
  // Write Hooks - Basketball Match Creation
  // ============================================
  const {
    writeContract: writeCreateBasketballMatch,
    data: basketballTxHash,
    isPending: isBasketballPending,
    error: basketballWriteError,
  } = useBettingMatchFactoryWriteCreateBasketballMatch();

  const {
    isLoading: isBasketballConfirming,
    isSuccess: isBasketballSuccess,
    data: basketballReceipt,
  } = useWaitForTransactionReceipt({
    hash: basketballTxHash,
  });

  // ============================================
  // Read Hooks
  // ============================================
  const {
    data: allMatches,
    isLoading: isLoadingMatches,
    isRefetching: isRefetchingMatches,
    refetch: refetchMatches,
  } = useBettingMatchFactoryReadGetAllMatches({
    address: factoryAddress,
    chainId: BETTING_CHAIN_ID,
  });

  const { data: sportTypeData } = useBettingMatchFactoryReadGetSportType({
    address: factoryAddress,
    args: allMatches && allMatches.length > 0 ? [allMatches[0]] : undefined,
    chainId: BETTING_CHAIN_ID,
  });

  // ============================================
  // Write Functions
  // ============================================
  const createFootballMatch = useCallback(
    (matchName: string, owner: Address, oracle: Address) => {
      if (!writeCreateFootballMatch) {
        console.error('writeCreateFootballMatch is not available');
        return;
      }
      writeCreateFootballMatch({
        address: factoryAddress,
        args: [matchName, owner, oracle],
      });
    },
    [writeCreateFootballMatch, factoryAddress]
  );

  const createBasketballMatch = useCallback(
    (matchName: string, owner: Address, oracle: Address) => {
      if (!writeCreateBasketballMatch) {
        console.error('writeCreateBasketballMatch is not available');
        return;
      }
      writeCreateBasketballMatch({
        address: factoryAddress,
        args: [matchName, owner, oracle],
      });
    },
    [writeCreateBasketballMatch, factoryAddress]
  );

  // Helper to get sport type for a specific match
  const getSportType = useCallback(
    (matchAddress: Address): number | undefined => {
      // This would require a separate read call, simplified here
      return sportTypeData as number | undefined;
    },
    [sportTypeData]
  );

  // ============================================
  // Return Hook Data
  // ============================================
  return {
    // Write functions
    createFootballMatch,
    createBasketballMatch,

    // Read data
    allMatches,
    getSportType,

    // States
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

    // Loading states
    isLoadingMatches,
    isRefetchingMatches,

    // Refetch
    refetchMatches,
  };
}
