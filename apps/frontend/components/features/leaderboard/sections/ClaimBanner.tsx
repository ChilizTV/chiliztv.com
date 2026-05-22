'use client';

import { formatUnits, type Address, type Hex } from 'viem';
import { Loader2 } from 'lucide-react';
import { useMyClaimableEpochs } from '@/hooks/api';
import { useLeaderboardClaim } from '@/hooks/useLeaderboardClaim';

interface ClaimBannerProps {
    readonly wallet: string | undefined;
}

const USDC_DECIMALS = 6;

function fmtUsdc(raw: string): string {
    return Number(formatUnits(BigInt(raw), USDC_DECIMALS)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

/**
 * Sticky banner at the top of `/leaderboard` when the connected wallet has
 * ≥1 claimable epoch. Each row is its own claim button with a `useSimulate`
 * pre-flight — disabled state surfaces the exact reason.
 */
export function ClaimBanner({ wallet }: ClaimBannerProps) {
    const { data } = useMyClaimableEpochs(wallet);
    const epochs = data?.epochs ?? [];
    const open = epochs.filter((e) => !e.alreadyClaimed);
    if (!wallet || open.length === 0) return null;

    return (
        <section className="mx-auto max-w-5xl px-4 pt-6">
            <div
                className="rounded-xl border p-5"
                style={{
                    borderColor: 'rgba(45,212,164,0.4)',
                    background: 'linear-gradient(180deg, rgba(45,212,164,0.08), rgba(45,212,164,0.02))',
                }}
            >
                <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2dd4a4]">
                    <span aria-hidden className="block h-0.5 w-4 bg-[#2dd4a4]" />
                    Prizes ready
                </div>
                <div className="font-display mt-2 text-[20px] font-extrabold uppercase tracking-tight text-white">
                    You have {open.length} {open.length === 1 ? 'reward' : 'rewards'} to claim
                </div>

                <div className="mt-4 grid gap-3">
                    {open.map((entry) => (
                        <ClaimRow
                            key={entry.epochId}
                            wallet={wallet as Address}
                            epochId={entry.epochId}
                            amount={BigInt(entry.amount)}
                            proof={entry.proof as Hex[]}
                            claimExpiry={entry.claimExpiry}
                            alreadyClaimed={entry.alreadyClaimed}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ClaimRow({
    wallet,
    epochId,
    amount,
    proof,
    claimExpiry,
    alreadyClaimed,
}: {
    wallet: Address;
    epochId: number;
    amount: bigint;
    proof: Hex[];
    claimExpiry: string;
    alreadyClaimed: boolean;
}) {
    const { canClaim, reason, claim, isConfirming } = useLeaderboardClaim({
        wallet,
        epochId,
        amount,
        proof,
        claimExpiry,
        alreadyClaimed,
    });

    const label = (() => {
        if (isConfirming) return 'Confirming…';
        if (reason === 'expired') return 'Expired';
        if (reason === 'already-claimed') return 'Claimed';
        if (reason === 'invalid-proof') return 'Proof invalid';
        if (reason === 'simulating') return 'Checking…';
        if (reason === 'pending') return 'Submitting…';
        if (reason === 'no-wallet') return 'Connect wallet';
        return 'Claim';
    })();

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#1E1E1E] bg-[#0d0d0d] px-4 py-3">
            <div>
                <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Epoch #{epochId}
                </div>
                <div className="font-display mt-1 text-[18px] font-extrabold uppercase tracking-tight text-white">
                    {fmtUsdc(amount.toString())} USDC
                </div>
            </div>
            <button
                type="button"
                onClick={claim}
                disabled={!canClaim}
                className="font-mono-ctv inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-all"
                style={{
                    background: canClaim ? '#E8001D' : '#3A3A3A',
                    cursor: canClaim ? 'pointer' : 'not-allowed',
                    boxShadow: canClaim ? '0 6px 20px rgba(232,0,29,0.25)' : 'none',
                }}
            >
                {isConfirming && <Loader2 size={12} className="animate-spin" />}
                {label}
            </button>
        </div>
    );
}
