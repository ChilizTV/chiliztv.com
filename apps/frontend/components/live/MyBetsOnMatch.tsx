'use client';

import { useMemo } from 'react';
import type { Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import {
    useBettingMatchWatchPayout,
    useBettingMatchWatchRefund,
    useBettingMatchWatchBetPlaced,
} from '@/lib/contracts/generated';
import { usePoolDecimals } from '@/hooks/usePoolDecimals';
import { useMyBetsOnMatch } from '@/components/features/dashboard/hooks/useMyBetsOnMatch';
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

    const counts = useMemo(() => computeBetCounts(bets), [bets]);
    const claimableTotal = useMemo(
        () => sumClaimablePayouts(bets, assetDecimals),
        [bets, assetDecimals],
    );

    const invalidate = () => {
        void qc.invalidateQueries({ queryKey: ['my-bets'] });
    };

    // Live invalidation — when *this* user's bets settle, refetch the feed.
    useBettingMatchWatchPayout({
        address: contractAddress,
        chainId: BETTING_CHAIN_ID,
        args: walletAddress ? { user: walletAddress as Address } : undefined,
        enabled: !!contractAddress && !!walletAddress,
        onLogs: invalidate,
    });
    useBettingMatchWatchRefund({
        address: contractAddress,
        chainId: BETTING_CHAIN_ID,
        args: walletAddress ? { user: walletAddress as Address } : undefined,
        enabled: !!contractAddress && !!walletAddress,
        onLogs: invalidate,
    });
    useBettingMatchWatchBetPlaced({
        address: contractAddress,
        chainId: BETTING_CHAIN_ID,
        args: walletAddress ? { user: walletAddress as Address } : undefined,
        enabled: !!contractAddress && !!walletAddress,
        onLogs: invalidate,
    });

    if (!walletAddress) {
        return <EmptyState lead="Connect your wallet to see your bets on this match." />;
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
            <div className="px-4 py-10 flex flex-col items-center gap-3 text-center">
                <div
                    className="text-[14px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                    You haven&apos;t bet on this match yet
                </div>
                <div className="text-[12px]" style={{ color: '#888', fontFamily: "'Barlow', sans-serif" }}>
                    Pick an outcome from the Markets tab to get started.
                </div>
                {onPickMarket && (
                    <button
                        type="button"
                        onClick={onPickMarket}
                        className="mt-1 px-4 h-9 rounded text-[11px] font-bold tracking-[0.08em] uppercase transition-colors"
                        style={{ background: '#E8001D', color: '#fff', fontFamily: "'Barlow', sans-serif" }}
                    >
                        Pick a market →
                    </button>
                )}
            </div>
        );
    }

    return (
        <div>
            {isError && (
                <div
                    className="mx-4 mt-3 px-3 py-2 rounded text-[11px]"
                    style={{
                        background: 'rgba(245,197,24,0.08)',
                        border: '1px solid rgba(245,197,24,0.3)',
                        color: '#F5C518',
                        fontFamily: "'Barlow', sans-serif",
                    }}
                >
                    Indexing service unavailable — showing the most recent cached data.
                </div>
            )}

            {counts.claimable > 0 && (
                <div
                    className="mx-4 mt-3 mb-2 flex items-center justify-between gap-3 rounded px-3 py-2"
                    style={{
                        background: 'rgba(232,0,29,0.08)',
                        border: '1px solid rgba(232,0,29,0.3)',
                    }}
                >
                    <div>
                        <div
                            className="text-[10px] font-bold uppercase tracking-[0.14em]"
                            style={{ color: '#E8001D', fontFamily: "'Barlow', sans-serif" }}
                        >
                            Wins ready
                        </div>
                        <div
                            className="text-[14px] font-bold"
                            style={{ color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
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
        <div
            className="px-4 py-8 text-center text-[12px]"
            style={{ color: '#555', fontFamily: "'Barlow', sans-serif" }}
        >
            {lead}
        </div>
    );
}
