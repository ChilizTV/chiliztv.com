const ACCENT = "#E8001D";

/**
 * Segmented horizontal pool-share bar used by {@link MatchCardDonut} when
 * at least one market has volume. Favorite outcome in red, others muted —
 * conveys the "shifting distribution" of a pari-mutuel pool without odds.
 *
 * Per-segment width is `share * 100%`; widths under 5% still render as a
 * thin sliver to keep the legend interpretable. `favIdx` controls the
 * accent fill; `null` renders all segments muted.
 */
export function DistributionBar({
    shares,
    labels,
    favIdx,
}: {
    shares: readonly number[];
    labels: readonly string[];
    favIdx: number | null;
}) {
    if (shares.length === 0) return null;

    return (
        <div className="flex flex-1 flex-col justify-end gap-2 border-t border-[#1A1A1A] pt-3.5 pb-1">
            <div className="flex h-[5px] w-full gap-[2px] overflow-hidden rounded-full bg-[#0d0d0d]">
                {shares.map((s, i) => {
                    const pct = Math.max(0, Math.min(100, Math.round(s * 100)));
                    const fav = favIdx === i;
                    return (
                        <span
                            key={i}
                            className="block h-full"
                            style={{
                                width: `${pct}%`,
                                background: fav ? ACCENT : "rgba(255,255,255,0.22)",
                            }}
                        />
                    );
                })}
            </div>
            <div className="font-mono-ctv flex items-center gap-2 text-[9.5px] uppercase tracking-[0.12em]">
                {shares.map((s, i) => {
                    const pct = Math.round(s * 100);
                    const fav = favIdx === i;
                    return (
                        <span key={i} className="flex items-center gap-2">
                            <span className={fav ? "text-white" : "text-white/45"}>
                                {labels[i] ?? "—"} <b className="font-bold">{pct}%</b>
                            </span>
                            {i < shares.length - 1 && <span className="text-white/20">·</span>}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
