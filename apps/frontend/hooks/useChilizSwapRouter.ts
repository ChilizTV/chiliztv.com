'use client';

import { useCallback } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import {
    useChilizSwapRouterWritePlaceBetWithUsdc,
    useChilizSwapRouterWritePlaceBetWithChz,
    useChilizSwapRouterWritePlaceBetWithToken,
    useChilizSwapRouterWriteDepositLiquidityWithUsdc,
    useChilizSwapRouterWriteDepositLiquidityWithChz,
    useChilizSwapRouterWriteDepositLiquidityWithToken,
    useChilizSwapRouterWriteDonateWithUsdc,
    useChilizSwapRouterWriteDonateWithChz,
    useChilizSwapRouterWriteDonateWithToken,
    useChilizSwapRouterWriteSubscribeWithUsdc,
    useChilizSwapRouterWriteSubscribeWithChz,
    useChilizSwapRouterWriteSubscribeWithToken,
} from '@/lib/contracts/generated';
import { chilizConfig } from '@/config/chiliz.config';

const ROUTER_ADDRESS = chilizConfig.chilizSwapRouter;

/**
 * Unified hook for the ChilizSwapRouter (FanX-protocol adapter). Wraps the
 * generated wagmi hooks for all user-facing entrypoints into one place so
 * dialogs (bet, deposit, donate, subscribe) don't each have to know which
 * router function maps to which payment token.
 *
 * Each helper returns transaction state in the project's standard shape
 * (`{ isPending, isConfirming, isSuccess, error, txHash }`).
 *
 * Token paths supported:
 *   - 'USDC'  → direct USDC, no swap
 *   - 'CHZ'   → native CHZ swapped via Kayen MasterRouterV2
 *   - <addr>  → arbitrary ERC20 swapped via Kayen tokenRouter
 */

export type SwapToken = 'USDC' | 'CHZ' | Address;

export interface TxState {
    isPending: boolean;
    isConfirming: boolean;
    isSuccess: boolean;
    /** True when the receipt came back with `status: 'reverted'` (on-chain failure). */
    isReverted: boolean;
    /** True when the user dismissed the wallet popup (MetaMask "Reject"). */
    isUserRejected: boolean;
    error: Error | null;
    txHash?: `0x${string}`;
}

function isUserRejectionError(err: Error | null): boolean {
    if (!err) return false;
    const msg = err.message.toLowerCase();
    return (
        msg.includes('user rejected') ||
        msg.includes('user denied') ||
        msg.includes('action_rejected') ||
        msg.includes('rejected the request')
    );
}

function useTxState(args: {
    data?: `0x${string}`;
    isPending: boolean;
    error: Error | null;
}): TxState {
    const {
        isLoading: isConfirming,
        isSuccess,
        data: receipt,
    } = useWaitForTransactionReceipt({ hash: args.data });
    const isReverted = receipt?.status === 'reverted';
    return {
        isPending: args.isPending,
        isConfirming,
        isSuccess: isSuccess && !isReverted,
        isReverted,
        isUserRejected: isUserRejectionError(args.error),
        error: args.error,
        txHash: args.data,
    };
}

export function useChilizSwapRouter() {
    // ── Bet entrypoints ────────────────────────────────────────────────────
    const placeBetUsdc = useChilizSwapRouterWritePlaceBetWithUsdc();
    const placeBetChz = useChilizSwapRouterWritePlaceBetWithChz();
    const placeBetToken = useChilizSwapRouterWritePlaceBetWithToken();

    // ── Deposit entrypoints ───────────────────────────────────────────────
    const depositUsdc = useChilizSwapRouterWriteDepositLiquidityWithUsdc();
    const depositChz = useChilizSwapRouterWriteDepositLiquidityWithChz();
    const depositToken = useChilizSwapRouterWriteDepositLiquidityWithToken();

    // ── Donation entrypoints ──────────────────────────────────────────────
    const donateUsdc = useChilizSwapRouterWriteDonateWithUsdc();
    const donateChz = useChilizSwapRouterWriteDonateWithChz();
    const donateToken = useChilizSwapRouterWriteDonateWithToken();

    // ── Subscription entrypoints ──────────────────────────────────────────
    const subscribeUsdc = useChilizSwapRouterWriteSubscribeWithUsdc();
    const subscribeChz = useChilizSwapRouterWriteSubscribeWithChz();
    const subscribeToken = useChilizSwapRouterWriteSubscribeWithToken();

    // ── Bet ─────────────────────────────────────────────────────────────────
    const placeBet = useCallback(
        (params: {
            token: SwapToken;
            matchAddress: Address;
            marketId: bigint;
            selection: bigint;
            amount: bigint;        // grossAmount in token's atomic units (USDC: 6dp, fan token: 18dp)
            amountOutMin: bigint;  // minimum USDC the swap must produce; 0 for USDC path
            deadline: bigint;      // unix seconds; ignored on USDC path
        }) => {
            const { token, matchAddress, marketId, selection, amount, amountOutMin, deadline } = params;
            if (token === 'USDC') {
                placeBetUsdc.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [matchAddress, marketId, selection, amount],
                });
            } else if (token === 'CHZ') {
                placeBetChz.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [matchAddress, marketId, selection, amountOutMin, deadline],
                    value: amount,
                });
            } else {
                placeBetToken.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [token, amount, matchAddress, marketId, selection, amountOutMin, deadline],
                });
            }
        },
        [placeBetUsdc, placeBetChz, placeBetToken],
    );

    const placeBetUsdcState = useTxState(placeBetUsdc);
    const placeBetChzState = useTxState(placeBetChz);
    const placeBetTokenState = useTxState(placeBetToken);

    // ── Deposit liquidity ─────────────────────────────────────────────────
    const depositLiquidity = useCallback(
        (params: {
            token: SwapToken;
            amount: bigint;
            amountOutMin: bigint;
            deadline: bigint;
            receiver: Address;
        }) => {
            const { token, amount, amountOutMin, deadline, receiver } = params;
            if (token === 'USDC') {
                depositUsdc.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [amount, receiver],
                });
            } else if (token === 'CHZ') {
                depositChz.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [amountOutMin, deadline, receiver],
                    value: amount,
                });
            } else {
                depositToken.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [token, amount, amountOutMin, deadline, receiver],
                });
            }
        },
        [depositUsdc, depositChz, depositToken],
    );

    const depositUsdcState = useTxState(depositUsdc);
    const depositChzState = useTxState(depositChz);
    const depositTokenState = useTxState(depositToken);

    // ── Donate ──────────────────────────────────────────────────────────────
    const donate = useCallback(
        (params: {
            token: SwapToken;
            streamer: Address;
            message: string;
            amount: bigint;        // grossAmount in token's atomic units (USDC: 6dp, fan token / CHZ: 18dp)
            amountOutMin: bigint;  // minimum USDC the swap must produce; 0 for USDC path
            deadline: bigint;      // unix seconds; ignored on USDC path
        }) => {
            const { token, streamer, message, amount, amountOutMin, deadline } = params;
            if (token === 'USDC') {
                donateUsdc.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [streamer, message, amount],
                });
            } else if (token === 'CHZ') {
                donateChz.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [streamer, message, amountOutMin, deadline],
                    value: amount,
                });
            } else {
                donateToken.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [token, amount, streamer, message, amountOutMin, deadline],
                });
            }
        },
        [donateUsdc, donateChz, donateToken],
    );

    const donateUsdcState = useTxState(donateUsdc);
    const donateChzState = useTxState(donateChz);
    const donateTokenState = useTxState(donateToken);

    // ── Subscribe ───────────────────────────────────────────────────────────
    const subscribe = useCallback(
        (params: {
            token: SwapToken;
            streamer: Address;
            duration: bigint;      // seconds
            amount: bigint;        // grossAmount in token's atomic units
            amountOutMin: bigint;  // minimum USDC the swap must produce; 0 for USDC path
            deadline: bigint;      // unix seconds; ignored on USDC path
        }) => {
            const { token, streamer, duration, amount, amountOutMin, deadline } = params;
            if (token === 'USDC') {
                subscribeUsdc.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [streamer, duration, amount],
                });
            } else if (token === 'CHZ') {
                subscribeChz.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [streamer, duration, amountOutMin, deadline],
                    value: amount,
                });
            } else {
                subscribeToken.writeContract({
                    address: ROUTER_ADDRESS,
                    args: [token, amount, streamer, duration, amountOutMin, deadline],
                });
            }
        },
        [subscribeUsdc, subscribeChz, subscribeToken],
    );

    const subscribeUsdcState = useTxState(subscribeUsdc);
    const subscribeChzState = useTxState(subscribeChz);
    const subscribeTokenState = useTxState(subscribeToken);

    return {
        // Bet
        placeBet,
        betState: pickActive(placeBetUsdcState, placeBetChzState, placeBetTokenState),

        // Deposit
        depositLiquidity,
        depositState: pickActive(depositUsdcState, depositChzState, depositTokenState),

        // Donate
        donate,
        donateState: pickActive(donateUsdcState, donateChzState, donateTokenState),

        // Subscribe
        subscribe,
        subscribeState: pickActive(subscribeUsdcState, subscribeChzState, subscribeTokenState),

        // Address constant for callers that need to set ERC20 allowance on the router
        routerAddress: ROUTER_ADDRESS,
    };
}

/**
 * Returns the most-recently-active state across the three token paths so the
 * caller can show a single status without having to know which path was used.
 * "Active" = pending or confirming or just-succeeded with a tx hash.
 */
function pickActive(...states: TxState[]): TxState {
    for (const s of states) {
        if (s.isPending || s.isConfirming) return s;
    }
    for (const s of states) {
        if (s.txHash) return s;
    }
    return states[0];
}
