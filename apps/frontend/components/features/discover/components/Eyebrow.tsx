import type { ReactNode } from "react";

const DEFAULT_COLOR = "#E8001D";

export function Eyebrow({
    children,
    dim = false,
    color = DEFAULT_COLOR,
}: {
    children: ReactNode;
    dim?: boolean;
    /** Hairline accent colour. Defaults to Chiliz red; pass the gold or
     *  green-pnl tokens for non-primary sections (cf. CLAUDE.md §5). */
    color?: string;
}) {
    return (
        <div
            className={`font-mono-ctv inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] ${
                dim ? "text-white/45" : "text-white/65"
            }`}
        >
            <span aria-hidden className="block h-[2px] w-7" style={{ background: color }} />
            <span>{children}</span>
        </div>
    );
}
