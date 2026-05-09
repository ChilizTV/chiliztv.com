'use client';

import { BdEyebrow } from './BdEyebrow';

export interface BetTokenOption {
    readonly key: string;
    readonly sym: string;
    readonly name: string;
    readonly balance: number;
    readonly decimals: number;
    readonly needsSwap: boolean;
    readonly logoUrl?: string;
    readonly logoBg?: string;
    readonly logoTxt?: string;
    readonly usdRate?: number;
}

interface TokenSelectModalProps {
    readonly open: boolean;
    readonly tokens: ReadonlyArray<BetTokenOption>;
    readonly onPick: (token: BetTokenOption) => void;
    readonly onClose: () => void;
}

export function TokenLogo({ token, size = 28 }: { token: Pick<BetTokenOption, 'sym' | 'logoUrl' | 'logoBg' | 'logoTxt'>; size?: number }) {
    if (token.logoUrl) {
        return (
            <span
                className="flex items-center justify-center overflow-hidden rounded-full"
                style={{ width: size, height: size, background: '#0d0d0d', border: '1px solid #2A2A2A' }}
            >
                <img src={token.logoUrl} alt={token.sym} className="h-full w-full object-cover" />
            </span>
        );
    }
    return (
        <span
            className="font-display flex items-center justify-center rounded-full font-extrabold text-white"
            style={{
                width: size,
                height: size,
                background: token.logoBg ?? '#1E1E1E',
                fontSize: Math.round(size * 0.42),
            }}
        >
            {token.logoTxt ?? token.sym.slice(0, 1)}
        </span>
    );
}

function fmtNum(n: number, dp = 2) {
    return n.toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function fmtUsd(n: number, dp = 2) {
    return '$' + fmtNum(n, dp);
}

/** Inline overlay anchored to the DialogContent (Radix sets it `position: fixed`,
 *  so our `absolute inset-0` covers the whole dialog box — header, body, footer.
 *  We keep the picker INSIDE the dialog tree so Radix's focus-trap doesn't
 *  mark it `inert` (which is what happens when you portal to `document.body`). */
export function TokenSelectModal({ open, tokens, onPick, onClose }: TokenSelectModalProps) {
    if (!open) return null;
    return (
        <div
            className="absolute inset-0 z-[100] flex items-end sm:items-center sm:justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-[400px] flex-col overflow-hidden rounded-t-2xl border border-[#1E1E1E] bg-[#0A0A0A] sm:rounded-2xl"
                style={{ maxHeight: 'min(560px, 80dvh)' }}
            >
                <div className="flex flex-shrink-0 items-center justify-between border-b border-[#1E1E1E] px-5 py-4">
                    <BdEyebrow>Select stake currency</BdEyebrow>
                    <button type="button" onClick={onClose} aria-label="Close picker" className="text-white/45 hover:text-white">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                    {tokens.map((tk) => {
                        const dim = tk.balance === 0;
                        return (
                            <button
                                key={tk.key}
                                type="button"
                                onClick={() => onPick(tk)}
                                className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-[#111] ${dim ? 'opacity-45' : ''}`}
                            >
                                <TokenLogo token={tk} size={32} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-display text-[14px] font-bold uppercase text-white">${tk.sym}</span>
                                        {tk.needsSwap && (
                                            <span className="font-mono-ctv text-[8px] uppercase tracking-[0.16em] text-[#E8001D]/70">Swaps via Kayen</span>
                                        )}
                                    </div>
                                    <div className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">{tk.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono-ctv text-[12px] font-semibold tabular-nums text-white">
                                        {fmtNum(tk.balance, tk.decimals > 2 ? 2 : tk.decimals)}
                                    </div>
                                    {tk.usdRate && tk.balance > 0 && (
                                        <div className="font-mono-ctv text-[9px] uppercase tracking-[0.16em] text-white/40">
                                            ≈ {fmtUsd(tk.balance * tk.usdRate)}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
