'use client';

/**
 * Fallback outcome picker for market types the UI doesn't have a dedicated
 * component for yet (GOALS_EXACT, POINTS_EXACT, future markets). Renders
 * outcomeCount buttons labelled "Outcome #N" with optional implied prob and
 * pool size.
 */

interface GenericOutcomePicksProps {
    readonly outcomeCount: number;
    readonly selected: bigint | null;
    readonly onSelect: (outcome: bigint) => void;
    readonly impliedProbBps?: ReadonlyArray<number>;
    readonly outcomePools?: ReadonlyArray<bigint>;
    /** USDC raw decimals — defaults to 6. */
    readonly usdcDecimals?: number;
    /** Override labels (e.g. "0", "1", "2+" for GOALS_EXACT buckets). */
    readonly labels?: ReadonlyArray<string>;
}

export function GenericOutcomePicks(props: GenericOutcomePicksProps) {
    const {
        outcomeCount,
        selected,
        onSelect,
        impliedProbBps,
        outcomePools,
        usdcDecimals = 6,
        labels,
    } = props;

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: outcomeCount }, (_v, idx) => {
                const outcome = BigInt(idx);
                const isSelected = selected === outcome;
                const label = labels?.[idx] ?? `Outcome #${idx}`;
                const prob = impliedProbBps?.[idx];
                const pool = outcomePools?.[idx];
                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => onSelect(outcome)}
                        aria-pressed={isSelected}
                        className={
                            'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8001D] '
                            + (isSelected
                                ? 'border-[#E8001D] bg-[#E8001D]/10'
                                : 'border-[#1E1E1E] bg-[#111] hover:border-[#2A2A2A]')
                        }
                    >
                        <span className="font-display text-[14px] font-bold uppercase tracking-[0.06em] text-white">
                            {label}
                        </span>
                        <span className="font-mono-ctv text-[10px] uppercase tracking-[0.16em] text-white/45">
                            {prob !== undefined
                                ? `${(prob / 100).toFixed(1)}% probability`
                                : pool !== undefined && pool > BigInt(0)
                                    ? `Pool ${formatUsdcCompact(pool, usdcDecimals)}`
                                    : 'No positions yet'}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function formatUsdcCompact(raw: bigint, decimals: number): string {
    const denom = BigInt(10) ** BigInt(decimals);
    const whole = Number(raw / denom);
    if (whole >= 1_000_000) return `$${(whole / 1_000_000).toFixed(1)}M`;
    if (whole >= 1_000) return `$${(whole / 1_000).toFixed(1)}K`;
    return `$${whole.toFixed(0)}`;
}
