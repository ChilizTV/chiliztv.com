const COLORS: Record<number, string> = {
  5: '#FF1737',
  4: '#E8001D',
  3: '#F5C518',
  2: '#F5C518',
  1: 'rgba(255,255,255,0.45)',
};

export function SeverityBadge({ severity }: Readonly<{ severity: number }>) {
  const color = COLORS[severity] ?? COLORS[1];
  return (
    <span
      className="font-mono-ctv inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
      style={{ color, background: `${color}14`, border: `1px solid ${color}40` }}
    >
      S{severity}
    </span>
  );
}
