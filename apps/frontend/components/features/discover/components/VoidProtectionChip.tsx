/**
 * Small pari-mutuel reassurance chip — shown next to the headline to remind
 * the user that markets with a winning outcome at zero stake get auto-refunded
 * by the contract. Visual maps to CLAUDE.md §5: dark bg, hairline border,
 * green shield icon (palette `green-pnl #2dd4a4`).
 */
export function VoidProtectionChip() {
    return (
        <span className="font-mono-ctv inline-flex items-center gap-2 rounded-full border border-[#1E1E1E] bg-[#0e0e0e] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55">
            <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2dd4a4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
            >
                <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
                <path d="M9 12l2 2 4-4" />
            </svg>
            <span>Void-protected · refunds if no winner</span>
        </span>
    );
}
