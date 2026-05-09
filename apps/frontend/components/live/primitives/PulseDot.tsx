"use client";

interface PulseDotProps {
  color?: string;
  size?: number;
}

export function PulseDot({ color = "#E8001D", size = 6 }: PulseDotProps) {
  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span
        className="ctv-pulse-dot absolute inset-0 rounded-full"
        style={{ background: color, opacity: 0.45 }}
      />
      <span
        className="relative inline-block rounded-full"
        style={{ width: size, height: size, background: color }}
      />
    </span>
  );
}
