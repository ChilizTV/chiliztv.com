/**
 * Surfaces the 1% leaderboard-fee fact next to the hero headline. Mirrors
 * the contract's `leaderboardFeeBps = 100` constant ([CLAUDE.md §6](../../../../../../CLAUDE.md)) —
 * 1% of every stake placed on a parimutuel market flows to the LeaderboardRewards
 * pool. Gold star icon (`#F5C518`) per the palette.
 */
export function LeaderboardFeeChip() {
    return (
        <span className="font-mono-ctv inline-flex items-center gap-2 rounded-full border border-[#1E1E1E] bg-[#0e0e0e] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/55">
            <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F5C518"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
            >
                <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
            </svg>
            <span>1% of every stake → leaderboard</span>
        </span>
    );
}
