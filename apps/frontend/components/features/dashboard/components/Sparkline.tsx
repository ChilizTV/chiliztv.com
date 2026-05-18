'use client';

interface SparklineProps {
    readonly data: ReadonlyArray<number>;
    readonly width?: number;
    readonly height?: number;
    readonly stroke?: string;
    readonly fill?: boolean;
}

/** Tiny SVG sparkline. Renders nothing for < 2 points. */
export function Sparkline({ data, width = 96, height = 28, stroke = '#2dd4a4', fill = true }: SparklineProps) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    const dx = width / (data.length - 1);
    const pts = data.map((v, i) => `${(i * dx).toFixed(1)},${(height - ((v - min) / span) * height).toFixed(1)}`).join(' ');
    const area = `0,${height} ${pts} ${width},${height}`;
    return (
        <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="block max-w-full"
        >
            {fill && <polygon points={area} fill={stroke} opacity="0.12" />}
            <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}
