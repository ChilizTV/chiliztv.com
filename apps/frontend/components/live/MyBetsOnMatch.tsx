'use client';

import { useMemo } from 'react';
import type { Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import {
    usePariMatchBaseWatchPositionClaimed,
    usePariMatchBaseWatchStakeRefunded,
    usePariMatchBaseWatchPositionTaken,
} from '@/lib/contracts/generated';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { useMyBetsOnMatch } from '@/components/features/dashboard/hooks/useMyBetsOnMatch';
import { useLocallyClaimed } from '@/components/features/dashboard/hooks/useLocallyClaimed';
import { BetRow } from '@/components/features/dashboard/components/BetRow';
import { computeBetCounts, sumClaimablePayouts } from '@/components/features/dashboard/domain/bets';
import { fmtUsd } from '@/components/features/dashboard/domain/formatters';

const BETTING_CHAIN_ID = 88882 as const;

interface MyBetsOnMatchProps {
    readonly contractAddress?: Address;
    readonly walletAddress?: string;
    readonly onPickMarket?: () => void;
}

/**
 * "My Bet on this match" tab — lists the user's bets on the open match
 * contract only, with claim CTAs. Source: dashboard `useMyBets` filtered
 * client-side. Watches Payout/Refund events to invalidate live.
 */
export function MyBetsOnMatch({ contractAddress, walletAddress, onPickMarket }: MyBetsOnMatchProps) {
    const qc = useQueryClient();
    const { assetDecimals } = usePoolDecimals();

    const { bets, isLoading, isError } = useMyBetsOnMatch({
        user: walletAddress,
        contractAddress,
    });

    const { map: claimedOverlay } = useLocallyClaimed();
    const counts = useMemo(() => computeBetCounts(bets, claimedOverlay), [bets, claimedOverlay]);
    const claimableTotal = useMemo(
        () => sumClaimablePayouts(bets, assetDecimals, claimedOverlay),
        [bets, assetDecimals, claimedOverlay],
    );

    const invalidate = () => {
        void qc.invalidateQueries({ queryKey: ['my-bets'] });
    };

    // Live invalidation — refetch when this user takes, claims or refunds a
    // position on the watched contract.
    usePariMatchBaseWatchPositionClaimed({
        address: contractAddress,
        chainId: BETTING_CHAIN_ID,
        args: walletAddress ? { user: walletAddress as Address } : undefined,
        enabled: !!contractAddress && !!walletAddress,
        onLogs: invalidate,
    });
    usePariMatchBaseWatchStakeRefunded({
        address: contractAddress,
        chainId: BETTING_CHAIN_ID,
        args: walletAddress ? { user: walletAddress as Address } : undefined,
        enabled: !!contractAddress && !!walletAddress,
        onLogs: invalidate,
    });
    usePariMatchBaseWatchPositionTaken({
        address: contractAddress,
        chainId: BETTING_CHAIN_ID,
        args: walletAddress ? { user: walletAddress as Address } : undefined,
        enabled: !!contractAddress && !!walletAddress,
        onLogs: invalidate,
    });

    if (!walletAddress) {
        return <EmptyState lead="Connect your wallet to see your predictions on this match." />;
    }

    if (isLoading && bets.length === 0) {
        return (
            <div className="px-4 py-4 space-y-2">
                <SkeletonBar height={48} />
                <SkeletonBar height={48} />
            </div>
        );
    }

    if (bets.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <span className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                    <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
                    No predictions yet
                </span>
                <div className="font-display text-[20px] font-extrabold uppercase tracking-tight text-white">
                    Place your first prediction on this match
                </div>
                <div className="text-[12px] font-light text-white/55">
                    Pick an outcome from the Markets tab to get started.
                </div>
                {onPickMarket && (
                    <button
                        type="button"
                        onClick={onPickMarket}
                        className="font-mono-ctv mt-1 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#FF1737]"
                        style={{ background: '#E8001D' }}
                    >
                        Open markets →
                    </button>
                )}
            </div>
        );
    }

    return (
        <div>
            {isError && (
                <div
                    className="font-mono-ctv mx-4 mt-3 rounded-md px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
                    style={{
                        background: 'rgba(245,197,24,0.08)',
                        border: '1px solid rgba(245,197,24,0.3)',
                        color: '#F5C518',
                    }}
                >
                    Indexing service unavailable — showing the most recent cached data.
                </div>
            )}

            {counts.claimable > 0 && (
                <div
                    className="mx-4 mb-2 mt-3 flex items-center justify-between gap-3 rounded-md px-3 py-2.5"
                    style={{
                        background: 'rgba(232,0,29,0.08)',
                        border: '1px solid rgba(232,0,29,0.3)',
                    }}
                >
                    <div>
                        <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
                            Wins ready
                        </div>
                        <div className="font-display text-[16px] font-extrabold uppercase tracking-tight text-white">
                            {counts.claimable} {counts.claimable === 1 ? 'win' : 'wins'} · {fmtUsd(claimableTotal)} USDC
                        </div>
                    </div>
                </div>
            )}

            <div>
                {bets.map((b) => (
                    <BetRow key={`${b.txHash}:${b.logIndex}`} bet={b} />
                ))}
            </div>
        </div>
    );
}

function SkeletonBar({ height }: { height: number }) {
    return (
        <div className="rounded animate-pulse" style={{ height, background: '#1E1E1E' }} />
    );
}

function EmptyState({ lead }: { lead: string }) {
    return (
        <div className="font-mono-ctv px-4 py-10 text-center text-[11px] uppercase tracking-[0.16em] text-white/45">
            {lead}
        </div>
    );
}
