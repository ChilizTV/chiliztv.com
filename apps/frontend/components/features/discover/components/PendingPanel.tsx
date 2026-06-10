/**
 * Lower-block panel for {@link MatchCardDonut} when the match contract is
 * still being deployed (`contractAddress == null`). Muted shimmer + soft
 * pulse — never out-shouts the magnetic stake-zone on sibling cards.
 *
 * Stateless, pure presentation — no props by design (the state branch is
 * decided by the parent card).
 */
export function PendingPanel() {
    return (
        <div className="ctv-shimmer relative mt-1 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-[#1E1E1E] bg-[#0d0d0d] px-4 py-6 text-center">
            <span className="ctv-soon-pulse flex items-center gap-2 whitespace-nowrap font-mono-ctv text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                <span aria-hidden className="block h-[7px] w-[7px] rounded-full bg-white/45" />
                Markets opening soon
            </span>
            <span className="font-mono-ctv text-[9.5px] uppercase tracking-[0.14em] text-white/30">
                Pool deploying on-chain · ~25s
            </span>
        </div>
    );
}
