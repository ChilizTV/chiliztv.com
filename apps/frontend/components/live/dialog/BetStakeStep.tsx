'use client';

import { useState } from 'react';
import { TokenLogo, TokenSelectModal, type BetTokenOption } from './TokenSelectModal';

interface BetStakeStepProps {
    readonly token: BetTokenOption;
    readonly tokens: ReadonlyArray<BetTokenOption>;
    readonly amount: string;
    readonly onAmountChange: (value: string) => void;
    readonly onTokenChange: (token: BetTokenOption) => void;
    readonly slippageBps: number;
    readonly onSlippageChange: (bps: number) => void;
    readonly slippagePresetsBps: ReadonlyArray<number>;
    readonly selectionLabel: string;
    /** Insufficient-balance flag computed by the shell from on-chain reads. */
    readonly insufficient: boolean;
    /** Optional FanX quote (USDC equivalent) — surfaces under the input + powers the payout preview. */
    readonly quotedUsdcAmount: number | null;
}

const PRESETS = ['10', '25', '50', '100', 'MAX'] as const;

function fmtNum(n: number, dp = 2) {
    return n.toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function fmtUsd(n: number, dp = 2) {
    return '$' + fmtNum(n, dp);
}

export function BetStakeStep({
    token,
    tokens,
    amount,
    onAmountChange,
    onTokenChange,
    slippageBps,
    onSlippageChange,
    slippagePresetsBps,
    selectionLabel,
    insufficient,
    quotedUsdcAmount,
}: BetStakeStepProps) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const numericAmount = Number(amount);
    const isValid = !Number.isNaN(numericAmount) && numericAmount > 0;

    return (
        <div className="relative">
            <div
                className="font-display uppercase leading-[0.95] tracking-[-0.005em] text-white"
                style={{ fontSize: 18, fontWeight: 800 }}
            >
                Set your stake
            </div>
            <div className="mt-2 text-[12px] font-light leading-[1.55] text-white/55">
                {token.needsSwap
                    ? `Your ${token.sym} will be swapped to USDC via Kayen, then locked in the BettingMatch contract.`
                    : 'USDC is locked in the BettingMatch contract. Settles automatically on full-time.'}
            </div>

            {/* Amount card */}
            <div className="mt-5 rounded-xl border border-[#1E1E1E] bg-[#111] p-5">
                <div className="flex items-center justify-between">
                    <span className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                        Stake amount
                    </span>
                    <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="flex items-center gap-2 rounded-md border border-[#2A2A2A] bg-[#0d0d0d] px-2.5 py-1.5 transition-colors hover:border-[#E8001D]"
                    >
                        <TokenLogo token={token} size={20} />
                        <span className="font-display text-[13px] font-bold uppercase text-white">${token.sym}</span>
                        <span className="text-white/45">▾</span>
                    </button>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                    <input
                        type="number"
                        min="0"
                        step="any"
                        value={amount}
                        onChange={(e) => onAmountChange(e.target.value)}
                        placeholder="0"
                        className="font-display w-full bg-transparent leading-none tracking-[-0.02em] text-white outline-none placeholder:text-white/15"
                        style={{ fontSize: 56, fontWeight: 800 }}
                    />
                    <span
                        className="font-display tabular-nums text-white/30 leading-none flex-shrink-0"
                        style={{ fontSize: 26, fontWeight: 800 }}
                    >
                        {token.sym}
                    </span>
                </div>

                {token.usdRate && isValid && (
                    <div className="font-mono-ctv mt-2 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        ≈ {fmtUsd(numericAmount * token.usdRate)} USDC
                    </div>
                )}
                {!token.usdRate && quotedUsdcAmount !== null && quotedUsdcAmount > 0 && (
                    <div className="font-mono-ctv mt-2 text-[11px] uppercase tracking-[0.16em] text-white/45">
                        ≈ {fmtUsd(quotedUsdcAmount)} USDC (Kayen quote)
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {PRESETS.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onAmountChange(p === 'MAX' ? token.balance.toString() : p)}
                                className="font-mono-ctv rounded-md border border-[#2A2A2A] bg-[#111] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65 transition-colors hover:border-[#E8001D] hover:text-white"
                            >
                                {p === 'MAX' ? 'Max' : p}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => onAmountChange(token.balance.toString())}
                        className="font-mono-ctv flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 hover:text-[#E8001D]"
                    >
                        Bal · {fmtNum(token.balance, token.decimals > 2 ? 2 : token.decimals)} {token.sym}
                    </button>
                </div>

                {insufficient && (
                    <div
                        className="font-mono-ctv mt-3 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                        style={{ color: '#FF1737', background: 'rgba(255,23,55,0.08)', borderColor: 'rgba(255,23,55,0.4)' }}
                    >
                        <span aria-hidden>⚠</span> Insufficient balance
                    </div>
                )}
            </div>

            {/* Slippage row — only when the token needs a Kayen swap. */}
            {token.needsSwap && (
                <div className="mt-4 rounded-xl border border-[#1E1E1E] bg-[#111] p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                                Swap slippage
                            </div>
                            <div className="font-mono-ctv mt-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                                Max price drift via Kayen
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {slippagePresetsBps.map((bps) => {
                                const active = bps === slippageBps;
                                return (
                                    <button
                                        key={bps}
                                        type="button"
                                        onClick={() => onSlippageChange(bps)}
                                        className={`font-mono-ctv rounded-md border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                                            active ? 'border-[#E8001D] bg-[#E8001D]/10 text-white' : 'border-[#2A2A2A] text-white/65 hover:text-white'
                                        }`}
                                    >
                                        {(bps / 100).toFixed(bps < 100 ? 2 : 1)}%
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Selection summary — payout preview computed by the shell from real odds. */}
            <div className="mt-4 rounded-xl border border-[#1E1E1E] bg-[#0d0d0d] p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="font-mono-ctv text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                            Your pick
                        </div>
                        <div
                            className="font-display mt-1.5 truncate uppercase tracking-[-0.005em] text-white"
                            style={{ fontSize: 15, fontWeight: 700 }}
                        >
                            {selectionLabel}
                        </div>
                    </div>
                </div>
            </div>

            <TokenSelectModal
                open={pickerOpen}
                tokens={tokens}
                onPick={(tk) => {
                    onTokenChange(tk);
                    setPickerOpen(false);
                }}
                onClose={() => setPickerOpen(false)}
            />
        </div>
    );
}
