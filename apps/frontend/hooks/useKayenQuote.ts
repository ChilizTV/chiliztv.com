'use client';

import { useReadContract } from 'wagmi';
import { useChilizSwapRouterReadTokenRouter } from '@/lib/contracts/generated';
import type { Address } from 'viem';
import { chilizConfig } from '@/config/chiliz.config';

const CHAIN_ID: number = chilizConfig.chainId;
const ROUTER_ADDRESS = chilizConfig.chilizSwapRouter;

// Minimal IKayenRouter slice for off-chain quoting. The on-chain Kayen
// (FanX) router exposes far more, but `getAmountsOut` is the only function
// we need from the frontend — it's a pure view returning the expected output
// amounts along the swap path.
const KAYEN_ROUTER_ABI = [
    {
        type: 'function',
        stateMutability: 'view',
        name: 'getAmountsOut',
        inputs: [
            { name: 'amountIn', type: 'uint256' },
            { name: 'path', type: 'address[]' },
        ],
        outputs: [{ name: 'amounts', type: 'uint256[]' }],
    },
] as const;

/**
 * Read-only Kayen/FanX swap quote. Resolves the configured Kayen router via
 * `ChilizSwapRouter.tokenRouter()`, then calls `getAmountsOut(amountIn, path)`
 * with the same path the on-chain router will use at swap time. The quote is
 * a *quote*, not a guarantee — slippage tolerance still has to be applied
 * before passing `amountOutMin` to a write call.
 *
 * @param amountIn Input amount in `tokenIn`'s atomic units (CHZ: wei, fan
 *                 token: 1e18, USDC: 1e6).
 * @param tokenIn  Address of the input token. Pass `WCHZ` for CHZ quotes —
 *                 the on-chain swap path for CHZ swaps is `[WCHZ, USDC]`.
 *                 USDC→USDC quotes are not supported (callers should skip
 *                 quoting and use the input directly).
 */
export function useKayenQuote(amountIn: bigint | undefined, tokenIn: Address | undefined) {
    const { data: kayenRouter } = useChilizSwapRouterReadTokenRouter({
        address: ROUTER_ADDRESS,
        chainId: CHAIN_ID,
    });

    const path = tokenIn ? ([tokenIn, chilizConfig.usdc] as const) : undefined;
    const enabled =
        amountIn !== undefined &&
        amountIn > BigInt(0) &&
        !!tokenIn &&
        !!kayenRouter &&
        // Skip when input is already USDC — getAmountsOut on a length-1 path reverts.
        tokenIn.toLowerCase() !== chilizConfig.usdc.toLowerCase();

    const { data, isLoading, error } = useReadContract({
        address: kayenRouter as Address | undefined,
        abi: KAYEN_ROUTER_ABI,
        functionName: 'getAmountsOut',
        args: amountIn !== undefined && path ? [amountIn, [...path]] : undefined,
        chainId: CHAIN_ID,
        query: { enabled },
    });

    const amounts = (data as readonly bigint[] | undefined) ?? undefined;
    const amountOut = amounts ? amounts[amounts.length - 1] : undefined;

    return { amountOut, amounts, isLoading, error };
}
