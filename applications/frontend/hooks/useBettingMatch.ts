/**
 * Hook for user interactions with a specific BettingMatch (FootballMatch) contract V2
 * Used to place bets, claim winnings, and view match information
 */

import { useCallback, useEffect } from 'react';
import {
  useBettingMatchWritePlaceBet,
  useBettingMatchWriteClaim,
  useBettingMatchWriteClaimRefund,
  useBettingMatchWriteClaimAll,
  useBettingMatchReadGetFootballMarket,
  useBettingMatchReadGetUserBets,
  useBettingMatchReadMatchName,
  useBettingMatchReadMarketCount,
  useBettingMatchReadPaused,
} from '@/lib/contracts/generated';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseEther } from 'viem';

// Market state enum (matches BettingMatch.MarketState)
export enum MarketState {
  Inactive = 0,
  Open = 1,
  Suspended = 2,
  Closed = 3,
  Resolved = 4,
  Cancelled = 5,
}

export interface MarketInfo {
  marketType: string;
  odds: bigint;
  state: MarketState;
  result: bigint;
}

export interface UserBet {
  amount: bigint;
  selection: bigint;
  claimed: boolean;
}

export interface UserBetWithIndex extends UserBet {
  betIndex: number;
}

interface BetState {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash?: `0x${string}`;
}

export interface UseBettingMatchReturn {
  // Write functions
  placeBet: (marketId: number, selection: number, amountInCHZ: string) => void;
  claim: (marketId: number, betIndex: number) => void;
  claimAll: (marketId: number) => void;
  claimRefund: (marketId: number, betIndex: number) => void;

  // Read functions - Market data
  getMarket: (marketId: number) => MarketInfo | undefined;
  marketCount: number | undefined;
  matchName: string | undefined;
  isPaused: boolean | undefined;

  // Read functions - User data
  getUserBet: (marketId: number, userAddress: Address) => UserBet | undefined;
  getUserBets: (marketId: number, userAddress: Address) => UserBetWithIndex[] | undefined;

  // States
  betState: BetState;
  claimState: BetState;
  claimAllState: BetState;
  refundState: BetState;

  // Loading states
  isLoadingMatchInfo: boolean;

  // Refetch functions
  refetchMarket: () => void;
  refetchUserBet: () => void;
}

export function useBettingMatch(
  matchAddress: Address,
  userAddress?: Address,
  marketId: number = 0 // Default to Winner market
): UseBettingMatchReturn {
  // ============================================
  // Write Hooks - Place Bet
  // ============================================
  const {
    writeContract: writePlaceBet,
    data: betTxHash,
    isPending: isBetPending,
    error: betWriteError,
  } = useBettingMatchWritePlaceBet();

  const {
    isLoading: isBetConfirming,
    isSuccess: isBetSuccess,
  } = useWaitForTransactionReceipt({
    hash: betTxHash,
  });

  // ============================================
  // Write Hooks - Claim Winnings
  // ============================================
  const {
    writeContract: writeClaim,
    data: claimTxHash,
    isPending: isClaimPending,
    error: claimWriteError,
  } = useBettingMatchWriteClaim();

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimSuccess,
  } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  // ============================================
  // Write Hooks - Claim All
  // ============================================
  const {
    writeContract: writeClaimAll,
    data: claimAllTxHash,
    isPending: isClaimAllPending,
    error: claimAllWriteError,
  } = useBettingMatchWriteClaimAll();

  const {
    isLoading: isClaimAllConfirming,
    isSuccess: isClaimAllSuccess,
  } = useWaitForTransactionReceipt({
    hash: claimAllTxHash,
  });

  // ============================================
  // Write Hooks - Claim Refund
  // ============================================
  const {
    writeContract: writeRefund,
    data: refundTxHash,
    isPending: isRefundPending,
    error: refundWriteError,
  } = useBettingMatchWriteClaimRefund();

  const {
    isLoading: isRefundConfirming,
    isSuccess: isRefundSuccess,
  } = useWaitForTransactionReceipt({
    hash: refundTxHash,
  });

  // ============================================
  // Read Hooks - Match Info
  // ============================================
  const {
    data: matchNameData,
    isLoading: isLoadingMatchName,
  } = useBettingMatchReadMatchName({
    address: matchAddress,
  });

  const {
    data: marketCountData,
  } = useBettingMatchReadMarketCount({
    address: matchAddress,
  });

  const {
    data: isPausedData,
  } = useBettingMatchReadPaused({
    address: matchAddress,
  });

  const {
    data: marketData,
    refetch: refetchMarket,
  } = useBettingMatchReadGetFootballMarket({
    address: matchAddress,
    args: [BigInt(marketId)],
  });

  // ============================================
  // Read Hooks - User Bets
  // ============================================
  const {
    data: userBetsData,
    refetch: refetchUserBet,
  } = useBettingMatchReadGetUserBets({
    address: matchAddress,
    args: userAddress ? [BigInt(marketId), userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  // ============================================
  // Write Functions
  // ============================================
  const placeBet = useCallback(
    (marketId: number, selection: number, amountInCHZ: string) => {
      if (!writePlaceBet) {
        console.error('writePlaceBet is not available');
        return;
      }
      const amountWei = parseEther(amountInCHZ);
      writePlaceBet({
        address: matchAddress,
        args: [BigInt(marketId), BigInt(selection)],
        value: amountWei,
      });
    },
    [writePlaceBet, matchAddress]
  );

  const claim = useCallback(
    (marketId: number, betIndex: number) => {
      if (!writeClaim) {
        console.error('writeClaim is not available');
        return;
      }
      writeClaim({
        address: matchAddress,
        args: [BigInt(marketId), BigInt(betIndex)],
      });
    },
    [writeClaim, matchAddress]
  );

  const claimAll = useCallback(
    (marketId: number) => {
      if (!writeClaimAll) {
        console.error('writeClaimAll is not available');
        return;
      }
      writeClaimAll({
        address: matchAddress,
        args: [BigInt(marketId)],
      });
    },
    [writeClaimAll, matchAddress]
  );

  const claimRefund = useCallback(
    (marketId: number, betIndex: number) => {
      if (!writeRefund) {
        console.error('writeRefund is not available');
        return;
      }
      writeRefund({
        address: matchAddress,
        args: [BigInt(marketId), BigInt(betIndex)],
      });
    },
    [writeRefund, matchAddress]
  );

  // ============================================
  // Helper Functions
  // ============================================
  const getMarket = useCallback(
    (marketId: number): MarketInfo | undefined => {
      if (!marketData) return undefined;

      // getFootballMarket returns: marketTypeStr, line, maxSelections, state, currentOdds, result, totalPool
      return {
        marketType: marketData[0] as string,
        odds: BigInt(marketData[4] as number),
        state: marketData[3] as MarketState,
        result: BigInt(marketData[5] as bigint),
      };
    },
    [marketData]
  );

  const getUserBets = useCallback(
    (_marketId: number, _userAddress: Address): UserBetWithIndex[] | undefined => {
      if (!userBetsData) return undefined;

      const bets = userBetsData as readonly {
        amount: bigint;
        selection: bigint;
        oddsIndex: number;
        timestamp: number;
        claimed: boolean;
      }[];
      return [...bets].map((bet, index) => ({
        amount: bet.amount,
        selection: bet.selection,
        claimed: bet.claimed,
        betIndex: index,
      }));
    },
    [userBetsData]
  );

  const getUserBet = useCallback(
    (marketId: number, userAddress: Address): UserBet | undefined => {
      const bets = getUserBets(marketId, userAddress);
      if (!bets || bets.length === 0) return undefined;
      // Return first unclaimed bet for backward compatibility, or first bet
      const firstUnclaimed = bets.find((b) => !b.claimed);
      const bet = firstUnclaimed ?? bets[0];
      return {
        amount: bet.amount,
        selection: bet.selection,
        claimed: bet.claimed,
      };
    },
    [getUserBets]
  );

  // ============================================
  // Auto-refetch after successful transactions
  // ============================================
  useEffect(() => {
    if (isBetSuccess || isClaimSuccess || isClaimAllSuccess || isRefundSuccess) {
      refetchMarket();
      refetchUserBet();
    }
  }, [
    isBetSuccess,
    isClaimSuccess,
    isClaimAllSuccess,
    isRefundSuccess,
    refetchMarket,
    refetchUserBet,
  ]);

  // ============================================
  // Return Hook Data
  // ============================================
  return {
    // Write functions
    placeBet,
    claim,
    claimAll,
    claimRefund,

    // Read functions - Market data
    getMarket,
    marketCount: marketCountData ? Number(marketCountData) : undefined,
    matchName: matchNameData as string | undefined,
    isPaused: isPausedData,

    // Read functions - User data
    getUserBet,
    getUserBets,

    // States
    betState: {
      isPending: isBetPending,
      isConfirming: isBetConfirming,
      isSuccess: isBetSuccess,
      error: betWriteError,
      txHash: betTxHash,
    },
    claimState: {
      isPending: isClaimPending,
      isConfirming: isClaimConfirming,
      isSuccess: isClaimSuccess,
      error: claimWriteError,
      txHash: claimTxHash,
    },
    claimAllState: {
      isPending: isClaimAllPending,
      isConfirming: isClaimAllConfirming,
      isSuccess: isClaimAllSuccess,
      error: claimAllWriteError,
      txHash: claimAllTxHash,
    },
    refundState: {
      isPending: isRefundPending,
      isConfirming: isRefundConfirming,
      isSuccess: isRefundSuccess,
      error: refundWriteError,
      txHash: refundTxHash,
    },

    // Loading states
    isLoadingMatchInfo: isLoadingMatchName,

    // Refetch functions
    refetchMarket,
    refetchUserBet,
  };
}
