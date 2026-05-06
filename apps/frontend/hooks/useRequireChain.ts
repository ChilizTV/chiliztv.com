'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { useCallback } from 'react';
import { chilizConfig } from '@/config/chiliz.config';

/**
 * Compares the connected wallet's chain to the deployed-contract chain
 * (`chilizConfig.chainId`) and exposes a `switch` action that asks the wallet
 * to swap networks. Use this anywhere a write transaction would otherwise
 * fire on the wrong chain — pool deposits, bets, donations, admin actions.
 *
 * Returned values are stable when the wallet is on the right chain, so callers
 * can use `isWrongChain` to gate UI without flicker during initial mount.
 */
export function useRequireChain(targetChainId: number = chilizConfig.chainId) {
    const { isConnected, chainId: connectedChainId } = useAccount();
    const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();

    const isWrongChain = isConnected && connectedChainId !== undefined && connectedChainId !== targetChainId;

    const switchToTarget = useCallback(() => {
        if (!switchChain) return;
        switchChain({ chainId: targetChainId });
    }, [switchChain, targetChainId]);

    return {
        isConnected,
        connectedChainId,
        targetChainId,
        isWrongChain,
        isSwitching,
        switchError,
        switchToTarget,
    };
}
