'use client';

import { ACTIVITY_META, type ActivityRow as ActivityRowType } from '../domain/activity';
import { fmtUsd, timeAgo } from '../domain/formatters';
import { txExplorerUrl } from '@/lib/explorer';

interface ActivityRowProps {
    readonly row: ActivityRowType;
}

export function ActivityRow({ row }: ActivityRowProps) {
    const m = ACTIVITY_META[row.type];
    const positive = row.amountUSDC > 0;
    const accentBg = m.accent.startsWith('#') ? m.accent + '14' : 'rgba(255,255,255,0.04)';
    const explorerHref = row.txHash ? txExplorerUrl(row.txHash) : null;

    return (
        <div
            className="grid items-start gap-4 border-b border-[#1E1E1E] px-6 py-3.5 transition-colors hover:bg-white/[0.015]"
            style={{ gridTemplateColumns: '100px minmax(0,1fr) 140px 140px' }}
        >
            <div>
                <span
                    className="font-mono-ctv inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: m.accent, background: accentBg, border: `1px solid ${m.accent}40` }}
                >
                    {m.label}
                </span>
            </div>

            <div className="min-w-0">
                <div className="truncate text-[13px] text-white/85">{row.label}</div>
                {row.betPick && (
                    <div className="mt-1.5">
                        <span
                            className="font-mono-ctv inline-flex items-center gap-1.5 rounded-sm px-1.5 py-[2px] text-[10px] font-bold uppercase tracking-[0.14em]"
                            style={{
                                color: row.betPick.tint,
                                background: row.betPick.tint.startsWith('#')
                                    ? `${row.betPick.tint}14`
                                    : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${row.betPick.tint.startsWith('#') ? `${row.betPick.tint}40` : '#1E1E1E'}`,
                            }}
                        >
                            <span aria-hidden style={{ background: row.betPick.tint }} className="block h-1.5 w-1.5 rounded-full" />
                            {row.betPick.label}
                        </span>
                    </div>
                )}
                <div className="font-mono-ctv mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">
                    {timeAgo(row.t)}
                </div>
            </div>

            <div
                className="font-mono-ctv text-right text-[13px] font-semibold tabular-nums"
                style={{ color: row.amountUSDC === 0 ? 'rgba(255,255,255,0.45)' : positive ? '#2dd4a4' : '#fff' }}
            >
                {fmtUsd(row.amountUSDC, { signed: true })}
            </div>

            <div className="text-right">
                {explorerHref ? (
                    <a
                        href={explorerHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View transaction ${row.ref} on ChiliScan`}
                        className="font-mono-ctv inline-flex items-center gap-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-[#E8001D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                    >
                        {row.ref}
                        <span aria-hidden className="text-[8px]">↗</span>
                    </a>
                ) : (
                    <span className="font-mono-ctv text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                        {row.ref}
                    </span>
                )}
            </div>
        </div>
    );
}
