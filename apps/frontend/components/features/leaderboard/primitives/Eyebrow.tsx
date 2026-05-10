import type { ReactNode } from 'react';

interface EyebrowProps {
    children: ReactNode;
    color?: string;
    dim?: boolean;
}

/**
 * Section eyebrow — small caps with a leading colored bar. The
 * leaderboard's eyebrow uses 11px (slightly bigger than the live page
 * one) and 0.16em tracking; kept local rather than reusing the live
 * primitives to avoid coupling features.
 */
export function Eyebrow({ children, color = '#E8001D', dim = false }: EyebrowProps) {
    const c = dim ? 'rgba(255,255,255,0.45)' : color;
    return (
        <div
            className="font-mono-ctv inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: c }}
        >
            <span aria-hidden className="block h-0.5 w-4" style={{ background: c }} />
            {children}
        </div>
    );
}
