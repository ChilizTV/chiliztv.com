'use client';

import { Compass, Coins, Tickets, ArrowDownToLine, ArrowLeftRight } from 'lucide-react';

export type QuickActionKey = 'discover' | 'pool' | 'bets' | 'swap' | 'withdraw';

interface QuickActionsStripProps {
    readonly isStreamer: boolean;
    readonly onAction: (key: QuickActionKey) => void;
}

interface ActionItem {
    readonly key: QuickActionKey;
    readonly label: string;
    readonly primary?: boolean;
    readonly icon: React.ReactNode;
}

const ITEMS: ReadonlyArray<ActionItem> = [
    { key: 'discover', label: 'Discover matches', primary: true, icon: <Compass size={12} strokeWidth={2.4} /> },
    { key: 'pool',     label: 'Open the pool',                  icon: <Coins size={12} strokeWidth={2.4} /> },
    { key: 'bets',     label: 'My predictions',                 icon: <Tickets size={12} strokeWidth={2.4} /> },
    { key: 'swap',     label: 'Swap → USDC',                    icon: <ArrowLeftRight size={12} strokeWidth={2.4} /> },
];

const STREAMER_ITEM: ActionItem = {
    key: 'withdraw',
    label: 'Withdraw revenue',
    icon: <ArrowDownToLine size={12} strokeWidth={2.4} />,
};

export function QuickActionsStrip({ isStreamer, onAction }: QuickActionsStripProps) {
    const items = isStreamer ? [...ITEMS, STREAMER_ITEM] : ITEMS;
    return (
        <section className="relative z-[5] border-y border-[#1E1E1E] bg-[#111]">
            <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-x-auto px-8 py-4 sm:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="font-mono-ctv flex-shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/35">
                    Quick actions
                </span>
                <span aria-hidden className="hidden h-3 w-px bg-[#2A2A2A] sm:inline-block" />
                {items.map((it) => (
                    <button
                        key={it.key}
                        type="button"
                        onClick={() => onAction(it.key)}
                        className="font-mono-ctv inline-flex flex-shrink-0 items-center gap-2 rounded-md border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]"
                        style={{
                            borderColor: it.primary ? '#E8001D' : '#2A2A2A',
                            background: it.primary ? 'rgba(232,0,29,0.10)' : 'transparent',
                            color: it.primary ? '#fff' : 'rgba(255,255,255,0.65)',
                            boxShadow: it.primary ? '0 6px 18px rgba(232,0,29,0.15)' : 'none',
                        }}
                    >
                        <span style={{ color: it.primary ? '#E8001D' : 'rgba(255,255,255,0.45)' }}>{it.icon}</span>
                        {it.label}
                        <span aria-hidden style={{ color: it.primary ? '#E8001D' : 'rgba(255,255,255,0.25)' }}>→</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
