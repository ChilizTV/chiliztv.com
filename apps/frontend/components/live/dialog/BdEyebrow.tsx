import type { ReactNode } from 'react';

interface BdEyebrowProps {
    readonly children: ReactNode;
}

/** Small red-bar eyebrow used at the top of every BetDialog phase. */
export function BdEyebrow({ children }: BdEyebrowProps) {
    return (
        <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
            <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
            {children}
        </div>
    );
}
