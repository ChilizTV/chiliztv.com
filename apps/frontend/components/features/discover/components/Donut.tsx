const SEG_COLORS = ["#E8001D", "#F5C518", "#2dd4a4"] as const;

interface DonutProps {
    readonly shares: readonly [number, number, number];
    readonly favIdx: 0 | 1 | 2;
    readonly size?: number;
    readonly stroke?: number;
}

/**
 * 3-segment radial chart for the 1X2 outcome distribution. Each segment is
 * a partial circle drawn via `strokeDasharray`; the favourite outcome
 * renders at full opacity, the others at 0.45. Rotated -90° so the first
 * segment starts at 12 o'clock.
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
                        stroke={SEG_COLORS[i]}
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

/** Per-segment outcome colour, shared with the legend rows in MatchCardDonut. */
export const DONUT_SEGMENT_COLORS = SEG_COLORS;
