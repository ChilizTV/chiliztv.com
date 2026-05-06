'use client';

import { useRequireChain } from '@/hooks/useRequireChain';
import { AlertTriangle } from 'lucide-react';

/**
 * Inline banner shown when the wallet is connected to a chain other than
 * the deployed-contract chain. Renders nothing when the wallet is absent or
 * already on the right chain.
 *
 * Drop this above a transaction CTA whenever the user is about to write
 * on-chain — it gives them a one-click switch path before the tx fails with
 * a generic provider error.
 */
export function NetworkGuard({ className = '' }: { className?: string }) {
    const { isWrongChain, targetChainId, isSwitching, switchToTarget } = useRequireChain();
    if (!isWrongChain) return null;

    const targetName = targetChainId === 88882 ? 'Chiliz Spicy' : targetChainId === 88888 ? 'Chiliz' : `chain ${targetChainId}`;

    return (
        <div
            className={`flex items-center gap-3 px-3 py-2 rounded text-[12px] ${className}`}
            style={{
                background: 'rgba(245,197,24,0.08)',
                border: '1px solid rgba(245,197,24,0.3)',
                color: '#F5C518',
                fontFamily: "'Barlow', sans-serif",
            }}
        >
            <AlertTriangle size={14} />
            <span className="flex-1">Wrong network — please switch to {targetName} to continue.</span>
            <button
                onClick={switchToTarget}
                disabled={isSwitching}
                className="px-3 py-1 rounded text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{
                    background: '#F5C518',
                    color: '#0F0F0F',
                    cursor: isSwitching ? 'wait' : 'pointer',
                    opacity: isSwitching ? 0.6 : 1,
                }}
            >
                {isSwitching ? 'Switching…' : 'Switch'}
            </button>
        </div>
    );
}
