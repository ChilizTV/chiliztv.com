/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck wagmi v2 generated read hooks compound TS depth limits when
// chained with the chainId pin. Runtime is verified by Foundry tests +
// the deployed pool on Spicy testnet (88882).
import { useCallback, useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import {
  useLiquidityPoolReadTotalAssets,
  useLiquidityPoolReadFreeBalance,
  useLiquidityPoolReadTotalLiabilities,
  useLiquidityPoolReadUtilization,
  useLiquidityPoolReadTotalSupply,
  useLiquidityPoolReadBalanceOf,
  useLiquidityPoolReadProtocolFeeBps,
  useLiquidityPoolReadMaxBetAmount,
  useLiquidityPoolReadDepositCooldownSeconds,
  useLiquidityPoolReadPaused,
  useLiquidityPoolReadPreviewDeposit,
  useLiquidityPoolReadPreviewWithdraw,
  useLiquidityPoolReadConvertToAssets,
  useLiquidityPoolWriteDeposit,
  useLiquidityPoolWriteWithdraw,
  useLiquidityPoolWriteRedeem,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';

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
  previewDeposit: (assets: bigint) => bigint | undefined;
  previewWithdraw: (assets: bigint) => bigint | undefined;
  convertToAssets: (shares: bigint) => bigint | undefined;

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
): UseLiquidityPoolReturn {

  // ── Pool stats ──────────────────────────────────────────────────────────────
  const { data: totalAssets, isLoading: l1, refetch: r1 } = useLiquidityPoolReadTotalAssets({ address: poolAddress, chainId: CHAIN_ID });
  const { data: freeBalance, isLoading: l2, refetch: r2 } = useLiquidityPoolReadFreeBalance({ address: poolAddress, chainId: CHAIN_ID });
  const { data: totalLiabilities, isLoading: l3, refetch: r3 } = useLiquidityPoolReadTotalLiabilities({ address: poolAddress, chainId: CHAIN_ID });
  const { data: utilization, isLoading: l4, refetch: r4 } = useLiquidityPoolReadUtilization({ address: poolAddress, chainId: CHAIN_ID });
  const { data: totalSupply, isLoading: l5, refetch: r5 } = useLiquidityPoolReadTotalSupply({ address: poolAddress, chainId: CHAIN_ID });
  const { data: protocolFeeBps, isLoading: l6, refetch: r6 } = useLiquidityPoolReadProtocolFeeBps({ address: poolAddress, chainId: CHAIN_ID });
  const { data: maxBetAmount, isLoading: l7, refetch: r7 } = useLiquidityPoolReadMaxBetAmount({ address: poolAddress, chainId: CHAIN_ID });
  const { data: depositCooldownSeconds, isLoading: l8, refetch: r8 } = useLiquidityPoolReadDepositCooldownSeconds({ address: poolAddress, chainId: CHAIN_ID });
  const { data: isPaused, isLoading: l9, refetch: r9 } = useLiquidityPoolReadPaused({ address: poolAddress, chainId: CHAIN_ID });

  // ── Per-user reads ──────────────────────────────────────────────────────────
  const { data: sharesData } = useLiquidityPoolReadBalanceOf({
    address: poolAddress,
    args: userAddress ? [userAddress] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!userAddress },
  });

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

  // ── Write hooks ─────────────────────────────────────────────────────────────
  const { writeContract: writeDeposit, data: depositHash, isPending: depositPending, error: depositError } = useLiquidityPoolWriteDeposit();
  const { data: depositReceipt, isLoading: depositConfirming, isSuccess: depositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });

  const { writeContract: writeWithdraw, data: withdrawHash, isPending: withdrawPending, error: withdrawError } = useLiquidityPoolWriteWithdraw();
  const { isLoading: withdrawConfirming, isSuccess: withdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

  const { writeContract: writeRedeem, data: redeemHash, isPending: redeemPending, error: redeemError } = useLiquidityPoolWriteRedeem();
  const { isLoading: redeemConfirming, isSuccess: redeemSuccess } = useWaitForTransactionReceipt({ hash: redeemHash });

  // ── Auto-refetch after successful tx ────────────────────────────────────────
  useEffect(() => {
    if (depositSuccess || withdrawSuccess || redeemSuccess) {
      r1(); r2(); r3(); r4(); r5(); refetchConvert();
    }
  }, [depositSuccess, withdrawSuccess, redeemSuccess, r1, r2, r3, r4, r5, refetchConvert]);

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
    r1(); r2(); r3(); r4(); r5(); r6(); r7(); r8(); r9();
  }, [r1, r2, r3, r4, r5, r6, r7, r8, r9]);

  return {
    stats: {
      totalAssets: totalAssets as bigint | undefined,
      freeBalance: freeBalance as bigint | undefined,
      totalLiabilities: totalLiabilities as bigint | undefined,
      utilization: utilization as bigint | undefined,
      totalSupply: totalSupply as bigint | undefined,
      protocolFeeBps: protocolFeeBps !== undefined ? Number(protocolFeeBps) : undefined,
      maxBetAmount: maxBetAmount as bigint | undefined,
      depositCooldownSeconds: depositCooldownSeconds !== undefined ? Number(depositCooldownSeconds) : undefined,
      isPaused: isPaused as boolean | undefined,
    },
    isLoadingStats: l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9,
    refetchStats,

    sharesOf: () => sharesData as bigint | undefined,
    previewDeposit: () => previewDepositData as bigint | undefined,
    previewWithdraw: () => previewWithdrawData as bigint | undefined,
    convertToAssets: () => convertToAssetsData as bigint | undefined,

    deposit,
    withdraw,
    redeem,

    depositState: { isPending: depositPending, isConfirming: depositConfirming, isSuccess: depositSuccess, error: depositError, txHash: depositHash },
    withdrawState: { isPending: withdrawPending, isConfirming: withdrawConfirming, isSuccess: withdrawSuccess, error: withdrawError, txHash: withdrawHash },
    redeemState: { isPending: redeemPending, isConfirming: redeemConfirming, isSuccess: redeemSuccess, error: redeemError, txHash: redeemHash },
  };
}
