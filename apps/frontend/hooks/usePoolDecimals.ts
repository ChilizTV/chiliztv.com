/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck wagmi v2 generated read hooks compound TS depth limits when
// chained with the chainId pin. Runtime is verified against the deployed
// pool on Spicy testnet (88882).
'use client';

import { erc20Abi, type Address } from 'viem';
import { useReadContract } from 'wagmi';
import {
  useLiquidityPoolReadAsset,
  useLiquidityPoolReadDecimals,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';

/**
 * Single source of truth for the pool's underlying-asset and share decimals.
 *
 * Why a hook (not a constant): the on-chain test USDC on Spicy is 18-decimal
 * to match Chiliz Chain conventions, while real (Circle) USDC is 6-decimal.
 * Hardcoding either number breaks one environment, so we read both from the
 * pool itself: `pool.asset()` → `asset.decimals()` for the underlying, and
 * `pool.decimals()` for the ERC4626 share token (asset decimals + offset).
 *
 * Returns `undefined` for either field while the reads are in flight; callers
 * should render placeholders (e.g. "—") and skip parsing until both resolve.
 */
export function usePoolDecimals() {
  const poolAddress = chilizConfig.liquidityPool;

  const { data: assetAddress } = useLiquidityPoolReadAsset({
    address: poolAddress,
    chainId: chilizConfig.chainId,
  });

  const { data: rawAssetDecimals } = useReadContract({
    abi: erc20Abi,
    address: assetAddress as Address | undefined,
    functionName: 'decimals',
    chainId: chilizConfig.chainId,
    query: { enabled: !!assetAddress },
  });

  const { data: rawShareDecimals } = useLiquidityPoolReadDecimals({
    address: poolAddress,
    chainId: chilizConfig.chainId,
  });

  return {
    asset: assetAddress as Address | undefined,
    assetDecimals: rawAssetDecimals !== undefined ? Number(rawAssetDecimals) : undefined,
    shareDecimals: rawShareDecimals !== undefined ? Number(rawShareDecimals) : undefined,
  };
}
