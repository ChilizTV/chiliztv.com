'use client';

interface BetFailureStepProps {
    /** "rejected" = user dismissed the wallet popup, "reverted" = tx mined and contract refused. */
    readonly kind: 'rejected' | 'reverted' | 'unknown';
    readonly txHash?: `0x${string}`;
    readonly reason?: string | null;
    readonly onRetry: () => void;
    readonly onClose: () => void;
}

function fmtTx(hash: `0x${string}`) {
    return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

const TITLE_BY_KIND: Record<BetFailureStepProps['kind'], string> = {
    rejected: 'Prediction cancelled',
    reverted: 'Prediction failed',
    unknown: 'Prediction failed',
};

const LEAD_BY_KIND: Record<BetFailureStepProps['kind'], string> = {
    rejected: 'You dismissed the wallet popup. Nothing was sent on-chain — your funds are untouched.',
    reverted: 'The transaction reached the blockchain but the contract refused it. Gas was spent but no stake was locked.',
    unknown: 'The transaction did not go through. Your funds are untouched.',
};

export function BetFailureStep({ kind, txHash, reason, onRetry, onClose }: BetFailureStepProps) {
    return (
        <div className="text-center">
            {/* Animated red cross */}
            <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(255,23,55,0.20), rgba(255,23,55,0.02) 70%)',
                    border: '1px solid rgba(255,23,55,0.45)',
                }}
            >
                <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#FF1737" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M18 6 6 18">
                        <animate attributeName="stroke-dasharray" from="0,40" to="40,0" dur="0.4s" fill="freeze" />
                    </path>
                    <path d="m6 6 12 12">
                        <animate attributeName="stroke-dasharray" from="0,40" to="40,0" dur="0.4s" begin="0.2s" fill="freeze" />
                    </path>
                </svg>
            </div>

            <div
                className="font-display mt-6 leading-[0.92] tracking-[-0.02em] text-white"
                style={{ fontSize: 44, fontWeight: 800 }}
            >
                {TITLE_BY_KIND[kind]}
            </div>
            <div className="mt-3 text-[14px] font-light leading-[1.55] text-white/65">
                {LEAD_BY_KIND[kind]}
            </div>

            {reason && (
                <div className="mt-5 rounded-xl border px-4 py-3 text-left"
                    style={{ borderColor: 'rgba(255,23,55,0.35)', background: 'rgba(255,23,55,0.06)' }}
                >
                    <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF1737]">
                        Reason from the contract
                    </div>
                    <div className="mt-1 text-[13px] font-light leading-[1.5] text-white/85">
                        {reason}
                    </div>
                </div>
            )}

            {txHash && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#1E1E1E] bg-[#0d0d0d] px-4 py-3">
                    <div className="min-w-0 flex-1 text-left">
                        <div className="font-mono-ctv text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">Tx hash</div>
                        <div className="font-mono-ctv mt-0.5 truncate text-[11px] tabular-nums text-white">{fmtTx(txHash)}</div>
                    </div>
                    <a
                        href={`https://testnet.chiliscan.com/tx/${txHash}`}
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
                    onClick={onClose}
                    className="font-display rounded-md border border-[#2A2A2A] px-5 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-white/85 hover:border-[#E8001D]"
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={onRetry}
                    className="font-display rounded-md bg-[#E8001D] px-5 py-3 text-[13px] font-bold uppercase tracking-[0.06em] text-white hover:bg-[#FF1737]"
                    style={{ boxShadow: '0 8px 32px rgba(232,0,29,0.25)' }}
                >
                    Try again →
                </button>
            </div>
        </div>
    );
}
