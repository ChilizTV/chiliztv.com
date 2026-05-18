/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck wagmi v2 generated read hooks compound TS depth limits when
// chained with the chainId pin. Runtime is verified by Foundry tests +
// the deployed pool on Spicy testnet (88882).
import { useCallback, useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { Address } from 'viem';
import {
  useLiquidityPoolReadBalanceOf,
  useLiquidityPoolReadPreviewDeposit,
  useLiquidityPoolReadPreviewWithdraw,
  useLiquidityPoolReadConvertToAssets,
  useLiquidityPoolReadConvertToShares,
  useLiquidityPoolReadPreviewMint,
  useLiquidityPoolReadPreviewRedeem,
  useLiquidityPoolReadLastDepositAt,
  useLiquidityPoolReadCostBasis,
  useLiquidityPoolWriteDeposit,
  useLiquidityPoolWriteWithdraw,
  useLiquidityPoolWriteRedeem,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';
import { usePoolState } from '@/hooks/api/usePoolState';
import { queryKeys } from '@/lib/query/keys';

// Pin all reads to the deployed chain. Without this, generated read hooks
// silently never fire when the user's wallet is on a different chain
// (or before the wallet has connected at all). Typed as plain `number` to
// keep wagmi's generated overload generics from blowing up TS depth limits;
// the runtime requirement is just "matches a configured chain in wagmi".
const CHAIN_ID: number = chilizConfig.chainId;

export interface PoolStats {
  totalAssets: bigint | undefined;
  freeBalance: bigint | undefined;
  totalLiabilities: bigint | undefined;
  utilization: bigint | undefined;
  totalSupply: bigint | undefined;
  protocolFeeBps: number | undefined;
  maxBetAmount: bigint | undefined;
  depositCooldownSeconds: number | undefined;
  isPaused: boolean | undefined;
  // ── New: pool economics surface for the LP-position UI + APY workflow ──
  treasuryShareBps: number | undefined;
  lpWithdrawalFeeBps: number | undefined;
  accruedTreasury: bigint | undefined;
  treasury: Address | undefined;
  pendingTreasury: Address | undefined;
  maxLiabilityPerMarketBps: number | undefined;
  maxLiabilityPerMatchBps: number | undefined;
}

interface TxState {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  txHash?: `0x${string}`;
}

export interface UseLiquidityPoolReturn {
  // Pool-wide stats
  stats: PoolStats;
  isLoadingStats: boolean;
  refetchStats: () => void;

  // Per-user reads
  sharesOf: (holder: Address) => bigint | undefined;
  costBasisOf: (holder: Address) => bigint | undefined;
  lastDepositAtOf: (holder: Address) => number | undefined;

  // Conversions / previews (stateless — argument-driven via the previewAmount
  // / previewShares args passed to the hook).
  previewDeposit: (assets: bigint) => bigint | undefined;
  previewWithdraw: (assets: bigint) => bigint | undefined;
  convertToAssets: (shares: bigint) => bigint | undefined;
  convertToShares: (assets: bigint) => bigint | undefined;
  previewMint: (shares: bigint) => bigint | undefined;
  previewRedeem: (shares: bigint) => bigint | undefined;

  // Writes
  deposit: (assets: bigint, receiver: Address) => void;
  withdraw: (assets: bigint, receiver: Address, owner: Address) => void;
  redeem: (shares: bigint, receiver: Address, owner: Address) => void;

  depositState: TxState;
  withdrawState: TxState;
  redeemState: TxState;
}

export function useLiquidityPool(
  poolAddress: Address,
  userAddress?: Address,
  previewAssetsAmount?: bigint,
  previewSharesAmount?: bigint,
): UseLiquidityPoolReturn {

  // ── Pool stats (backend-mutualised) ─────────────────────────────────────────
  // The 16 pool-global viem reads previously made here against the public
  // Chiliz RPC are now served by `/pool/state` from the backend cache (TTL
  // 15 s, jitter ±20 %). Per-user fields and argument-driven previews stay
  // on direct viem reads below.
  const queryClient = useQueryClient();
  const poolStateQuery = usePoolState();
  const state = poolStateQuery.data;

  // ── Per-user reads (stay on viem — user-scoped, can't be mutualised) ───────
  const { data: sharesData, refetch: refetchShares } = useLiquidityPoolReadBalanceOf({
    address: poolAddress,
    args: userAddress ? [userAddress] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!userAddress },
  });
  const { data: costBasisData, refetch: refetchCostBasis } = useLiquidityPoolReadCostBasis({
    address: poolAddress,
    args: userAddress ? [userAddress] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!userAddress },
  });
  const { data: lastDepositAtData, refetch: refetchLastDeposit } = useLiquidityPoolReadLastDepositAt({
    address: poolAddress,
    args: userAddress ? [userAddress] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!userAddress },
  });

  // ── Stateless asset/share conversions (argument-driven, no point caching) ──
  const { data: previewDepositData } = useLiquidityPoolReadPreviewDeposit({
    address: poolAddress,
    args: previewAssetsAmount !== undefined ? [previewAssetsAmount] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: previewAssetsAmount !== undefined },
  });

  const { data: previewWithdrawData } = useLiquidityPoolReadPreviewWithdraw({
    address: poolAddress,
    args: previewAssetsAmount !== undefined ? [previewAssetsAmount] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: previewAssetsAmount !== undefined },
  });

  const { data: convertToAssetsData, refetch: refetchConvert } = useLiquidityPoolReadConvertToAssets({
    address: poolAddress,
    args: sharesData !== undefined ? [sharesData] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: sharesData !== undefined },
  });

  const { data: convertToSharesData } = useLiquidityPoolReadConvertToShares({
    address: poolAddress,
    args: previewAssetsAmount !== undefined ? [previewAssetsAmount] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: previewAssetsAmount !== undefined },
  });

  const { data: previewMintData } = useLiquidityPoolReadPreviewMint({
    address: poolAddress,
    args: previewSharesAmount !== undefined ? [previewSharesAmount] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: previewSharesAmount !== undefined },
  });

  const { data: previewRedeemData } = useLiquidityPoolReadPreviewRedeem({
    address: poolAddress,
    args: previewSharesAmount !== undefined ? [previewSharesAmount] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: previewSharesAmount !== undefined },
  });

  // ── Write hooks ─────────────────────────────────────────────────────────────
  const { writeContract: writeDeposit, data: depositHash, isPending: depositPending, error: depositError } = useLiquidityPoolWriteDeposit();
  const { isLoading: depositConfirming, isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });

  const { writeContract: writeWithdraw, data: withdrawHash, isPending: withdrawPending, error: withdrawError } = useLiquidityPoolWriteWithdraw();
  const { isLoading: withdrawConfirming, isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

  const { writeContract: writeRedeem, data: redeemHash, isPending: redeemPending, error: redeemError } = useLiquidityPoolWriteRedeem();
  const { isLoading: redeemConfirming, isSuccess: redeemSuccess } = useWaitForTransactionReceipt({ hash: redeemHash });

  // ── Auto-refetch after successful tx ────────────────────────────────────────
  // User-scoped reads refresh immediately (own balance / cost basis / last
  // deposit). The pool-global state is invalidated so React Query refetches
  // — the backend cache may still serve a stale snapshot for up to 15 s,
  // but the user's own position is visibly fresh and the aggregate catches
  // up on the next tick.
  useEffect(() => {
    if (depositSuccess || withdrawSuccess || redeemSuccess) {
      queryClient.invalidateQueries({ queryKey: queryKeys.pool.state() });
      refetchConvert();
      refetchShares();
      refetchCostBasis();
      refetchLastDeposit();
    }
  }, [depositSuccess, withdrawSuccess, redeemSuccess, queryClient, refetchConvert, refetchShares, refetchCostBasis, refetchLastDeposit]);

  // ── Write functions ─────────────────────────────────────────────────────────
  const deposit = useCallback(
    (assets: bigint, receiver: Address) => {
      writeDeposit({ address: poolAddress, args: [assets, receiver] });
    },
    [writeDeposit, poolAddress],
  );

  const withdraw = useCallback(
    (assets: bigint, receiver: Address, owner: Address) => {
      writeWithdraw({ address: poolAddress, args: [assets, receiver, owner] });
    },
    [writeWithdraw, poolAddress],
  );

  const redeem = useCallback(
    (shares: bigint, receiver: Address, owner: Address) => {
      writeRedeem({ address: poolAddress, args: [shares, receiver, owner] });
    },
    [writeRedeem, poolAddress],
  );

  const refetchStats = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.pool.state() });
  }, [queryClient]);

  return {
    stats: {
      totalAssets: state?.totalAssets,
      freeBalance: state?.freeBalance,
      totalLiabilities: state?.totalLiabilities,
      utilization: state?.utilization,
      totalSupply: state?.totalSupply,
      protocolFeeBps: state?.protocolFeeBps,
      maxBetAmount: state?.maxBetAmount,
      depositCooldownSeconds: state?.depositCooldownSeconds,
      isPaused: state?.paused,
      treasuryShareBps: state?.treasuryShareBps,
      lpWithdrawalFeeBps: state?.lpWithdrawalFeeBps,
      accruedTreasury: state?.accruedTreasury,
      treasury: state?.treasury,
      pendingTreasury: state?.pendingTreasury,
      maxLiabilityPerMarketBps: state?.maxLiabilityPerMarketBps,
      maxLiabilityPerMatchBps: state?.maxLiabilityPerMatchBps,
    },
    isLoadingStats: poolStateQuery.isLoading,
    refetchStats,

    sharesOf: () => sharesData as bigint | undefined,
    costBasisOf: () => costBasisData as bigint | undefined,
    lastDepositAtOf: () => lastDepositAtData !== undefined ? Number(lastDepositAtData) : undefined,
    previewDeposit: () => previewDepositData as bigint | undefined,
    previewWithdraw: () => previewWithdrawData as bigint | undefined,
    convertToAssets: () => convertToAssetsData as bigint | undefined,
    convertToShares: () => convertToSharesData as bigint | undefined,
    previewMint: () => previewMintData as bigint | undefined,
    previewRedeem: () => previewRedeemData as bigint | undefined,

    deposit,
    withdraw,
    redeem,

    depositState: { isPending: depositPending, isConfirming: depositConfirming, isSuccess: depositSuccess, error: depositError, txHash: depositHash },
    withdrawState: { isPending: withdrawPending, isConfirming: withdrawConfirming, isSuccess: withdrawSuccess, error: withdrawError, txHash: withdrawHash },
    redeemState: { isPending: redeemPending, isConfirming: redeemConfirming, isSuccess: redeemSuccess, error: redeemError, txHash: redeemHash },
  };
}
