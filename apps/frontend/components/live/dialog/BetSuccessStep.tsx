'use client';

import { useRouter } from 'next/navigation';

interface BetSuccessStepProps {
    readonly txHash?: `0x${string}`;
    readonly selectionLabel: string;
    readonly stakeLabel: string;
    readonly oddsDecimal: number | null;
    readonly netPayoutLabel: string | null;
    readonly onAnother: () => void;
    readonly onClose: () => void;
}

function fmtTx(hash: `0x${string}`) {
    return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

export function BetSuccessStep({
    txHash,
    selectionLabel,
    stakeLabel,
    oddsDecimal,
    netPayoutLabel,
    onAnother,
    onClose,
}: BetSuccessStepProps) {
    const router = useRouter();

    const handleViewMyBets = () => {
        router.push('/dashboard#bets');
        onClose();
    };

    return (
        <div className="text-center">
            {/* Animated check — SVG dasharray trace */}
            <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(45,212,164,0.20), rgba(45,212,164,0.02) 70%)',
                    border: '1px solid rgba(45,212,164,0.45)',
                }}
            >
                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#2dd4a4" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 13l4 4L19 7">
                        <animate attributeName="stroke-dasharray" from="0,40" to="40,0" dur="0.4s" fill="freeze" />
                    </path>
                </svg>
            </div>

            <div
                className="font-display mt-6 leading-[0.92] tracking-[-0.02em] text-white"
                style={{ fontSize: 44, fontWeight: 800 }}
            >
                Prediction placed.
            </div>
            <div className="mt-3 text-[14px] font-light leading-[1.55] text-white/65">
                Your stake is locked in the prediction contract.
                <br />
                You&apos;ll see the result the moment full-time settles on-chain.
            </div>

            {/* Summary card */}
            <div className="mt-6 rounded-xl border border-[#1E1E1E] bg-[#111] p-5 text-left">
                <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                    Selection
                </div>
                <div
                    className="font-display mt-1.5 uppercase tracking-[-0.005em] text-white"
                    style={{ fontSize: 16, fontWeight: 800 }}
                >
                    {selectionLabel}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#1E1E1E] pt-4">
                    <div>
                        <div className="font-mono-ctv text-[9px] uppercase tracking-[0.16em] text-white/40">Stake</div>
                        <div className="font-display mt-1 tabular-nums text-white" style={{ fontSize: 16, fontWeight: 700 }}>
                            {stakeLabel}
                        </div>
                    </div>
                    <div>
                        <div className="font-mono-ctv text-[9px] uppercase tracking-[0.16em] text-white/40">Odds</div>
                        <div className="font-display mt-1 tabular-nums text-white" style={{ fontSize: 16, fontWeight: 700 }}>
                            {oddsDecimal !== null ? oddsDecimal.toFixed(2) : '—'}
                        </div>
                    </div>
                    <div>
                        <div className="font-mono-ctv text-[9px] uppercase tracking-[0.16em] text-white/40">Net payout</div>
                        <div className="font-display mt-1 tabular-nums text-[#2dd4a4]" style={{ fontSize: 16, fontWeight: 700 }}>
                            {netPayoutLabel ?? '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tx hash */}
            {txHash && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#1E1E1E] bg-[#0d0d0d] px-4 py-3">
                    <div className="min-w-0 flex-1 text-left">
                        <div className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">Tx hash</div>
                        <div className="font-mono-ctv mt-0.5 truncate text-[11px] tabular-nums text-white">{fmtTx(txHash)}</div>
                    </div>
                    <a
                        href={`https://scan.chiliz.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-ctv ml-3 flex flex-shrink-0 items-center gap-1.5 rounded-md border border-[#2A2A2A] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/65 hover:border-[#E8001D] hover:text-white"
                    >
                        Scan ↗
                    </a>
                </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={onAnother}
                    className="font-display rounded-md border border-[#2A2A2A] px-5 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-white/85 hover:border-[#E8001D]"
                >
                    Predict another market
                </button>
                <button
                    type="button"
                    onClick={handleViewMyBets}
                    className="font-display rounded-md bg-[#E8001D] px-5 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-white hover:bg-[#FF1737]"
                    style={{ boxShadow: '0 8px 32px rgba(232,0,29,0.25)' }}
                >
                    View my predictions →
                </button>
            </div>
        </div>
    );
}
