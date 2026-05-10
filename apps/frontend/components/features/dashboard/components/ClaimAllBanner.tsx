'use client';

import { Loader2 } from 'lucide-react';
import { ActionPill } from './ActionPill';
import { fmtUsd } from '../domain/formatters';

interface ClaimAllBannerProps {
    readonly count: number;
    readonly totalUSDC: number;
    readonly onClaim: () => void;
    readonly busy?: boolean;
    /** `{ done, total }` while a batch is in-flight (one tx per market). */
    readonly progress?: { readonly done: number; readonly total: number } | null;
}

/** "X wins ready · $Y · Claim all" banner above the bets table. */
export function ClaimAllBanner({ count, totalUSDC, onClaim, busy, progress }: ClaimAllBannerProps) {
    if (count <= 0) return null;
    const showProgress = busy && progress && progress.total > 1;
    return (
        <div
            className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-xl border px-6 py-5"
            style={{
                borderColor: 'rgba(232,0,29,0.4)',
                background: 'linear-gradient(90deg, rgba(232,0,29,0.10) 0%, rgba(232,0,29,0.02) 60%, transparent 100%)',
            }}
        >
            <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #E8001D, transparent)' }} />
            <div className="flex items-center gap-4">
                <span
                    className="ctv-pulse-dot inline-block h-2 w-2 rounded-full bg-[#E8001D]"
                    style={{ boxShadow: '0 0 12px #E8001D' }}
                />
                <div>
                    <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8001D]">
                        Winnings ready
                    </div>
                    <div className="font-display mt-1 text-[26px] font-extrabold uppercase leading-none tracking-[-0.01em] text-white">
                        {count} {count === 1 ? 'Win' : 'Wins'} · {fmtUsd(totalUSDC)} USDC
                    </div>
                    {showProgress && (
                        <div className="font-mono-ctv mt-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                            Claiming market {Math.min(progress!.done + 1, progress!.total)} of {progress!.total}…
                        </div>
                    )}
                </div>
            </div>
            <ActionPill primary onClick={onClaim} disabled={busy}>
                {busy ? (
                    <span className="inline-flex items-center gap-2">
                        <Loader2 size={11} className="animate-spin" />
                        Confirming…
                    </span>
                ) : (
                    <>
                        Claim all <span aria-hidden>→</span>
                    </>
                )}
            </ActionPill>
        </div>
    );
}
