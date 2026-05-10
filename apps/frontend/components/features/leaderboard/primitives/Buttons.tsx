import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Size = 'sm' | 'md';

interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
    children: ReactNode;
    size?: Size;
    full?: boolean;
}

const PAD: Record<Size, string> = {
    sm: 'px-4 py-2.5 text-[10px]',
    md: 'px-5 py-3.5 text-[11px]',
};

/** Solid red CTA used for primary leaderboard actions. */
export function PrimaryBtn({
    children,
    size = 'md',
    full = false,
    className = '',
    type = 'button',
    ...rest
}: BtnProps) {
    return (
        <button
            type={type}
            className={`font-mono-ctv inline-flex ${full ? 'w-full' : ''} items-center justify-center gap-2 rounded-md border border-[#E8001D] bg-[#E8001D] ${PAD[size]} font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-[#FF1737] hover:bg-[#FF1737] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D]/40 ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

/** Outlined dark CTA — secondary actions ("See the split", external links). */
export function GhostBtn({
    children,
    size = 'md',
    full = false,
    className = '',
    type = 'button',
    ...rest
}: BtnProps) {
    return (
        <button
            type={type}
            className={`font-mono-ctv inline-flex ${full ? 'w-full' : ''} items-center justify-center gap-2 rounded-md border border-[#2A2A2A] bg-[#111] ${PAD[size]} font-bold uppercase tracking-[0.18em] text-white/85 transition-colors hover:border-[#3A3A3A] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}
