'use client';

import { erc20Abi, type Address } from 'viem';
import { useReadContract } from 'wagmi';
import { chilizConfig } from '@/config/chiliz.config';

/**
 * Decimals of the USDC token the pari-mutuel system settles in.
 *
 * The LiquidityPool was removed when the system moved to pari-mutuel
 * (escrow-in-match) accounting, so this hook now simply reads `decimals()`
 * on the configured USDC token.
 *
 * Returns `undefined` while the read is in flight; callers should render
 * placeholders ("—") and skip parsing until it resolves.
 *
 * `asset` is kept in the return shape for callers that previously used the
 * old ERC4626 pool helper — it's just the USDC address now.
 */
export function usePoolDecimals() {
  const asset = chilizConfig.usdc;

  const { data: rawAssetDecimals } = useReadContract({
    abi: erc20Abi,
    address: asset as Address,
    functionName: 'decimals',
    chainId: chilizConfig.chainId,
  });

  return {
    asset,
    assetDecimals: rawAssetDecimals !== undefined ? Number(rawAssetDecimals) : undefined,
    /** Kept for source-compat with callers of the old pool helper. */
    shareDecimals: rawAssetDecimals !== undefined ? Number(rawAssetDecimals) : undefined,
  };
}
