// 3 base colours for the WINNER market (Home / Draw / Away). For 2-outcome
// markets (GOALS_TOTAL, BOTH_SCORE, …) we use the 1st + 3rd to keep the
// red/teal contrast and reserve gold for "draw-ish" middle outcomes.
const SEG_COLORS = ["#E8001D", "#F5C518", "#2dd4a4"] as const;

interface DonutProps {
    readonly shares: readonly number[];
    readonly favIdx: number;
    readonly size?: number;
    readonly stroke?: number;
}

/** Pick a colour for outcome `i` given the total segment count. */
export function donutColor(i: number, total: number): string {
    if (total === 2) return i === 0 ? SEG_COLORS[0] : SEG_COLORS[2];
    return SEG_COLORS[i] ?? SEG_COLORS[SEG_COLORS.length - 1];
}

/**
 * Radial chart for an outcome distribution — 2 or 3 segments depending on
 * the market. Each segment is a partial circle drawn via `strokeDasharray`;
 * the favourite outcome renders at full opacity, the others at 0.45.
 * Rotated -90° so the first segment starts at 12 o'clock.
 */
export function Donut({ shares, favIdx, size = 96, stroke = 14 }: DonutProps) {
    const r = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const C = 2 * Math.PI * r;
    let acc = 0;
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: "rotate(-90deg)" }}
            aria-hidden
        >
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1A1A" strokeWidth={stroke} />
            {shares.map((pct, i) => {
                const len = C * pct;
                const seg = (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={donutColor(i, shares.length)}
                        strokeWidth={stroke}
                        strokeDasharray={`${len} ${C - len}`}
                        strokeDashoffset={-acc}
                        opacity={i === favIdx ? 1 : 0.45}
                        style={{ transition: "stroke-dasharray 400ms, opacity 400ms" }}
                    />
                );
                acc += len;
                return seg;
            })}
        </svg>
    );
}

/** Per-segment outcome colour palette (3 max), shared with the legend rows. */
export const DONUT_SEGMENT_COLORS = SEG_COLORS;
