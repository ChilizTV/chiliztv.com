export interface StatRow {
  label: string;
  value: string;
  delta?: string;
  deltaColor?: string;
}

export function DiscoverStats({ rows }: { rows: StatRow[] }) {
  return (
    <div
      className="relative z-[4] grid grid-cols-2 border-y border-[#1E1E1E] lg:grid-cols-4"
      style={{
        background:
          "linear-gradient(90deg, rgba(232,0,29,0.04), transparent 50%, rgba(232,0,29,0.04))",
      }}
    >
      {rows.map(({ label, value, delta, deltaColor }, i) => (
        <div
          key={label}
          className="relative px-9 py-8"
          style={{
            borderRight:
              i < rows.length - 1 ? "1px solid #1E1E1E" : undefined,
            borderTop: i >= 2 ? "1px solid #1E1E1E" : undefined,
          }}
        >
          <div className="font-mono-ctv mb-2.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
            {label}
          </div>
          <div className="font-display text-[44px] font-extrabold leading-none tracking-[-0.01em] text-white">
            {value}
          </div>
          {delta && (
            <div
              className="font-mono-ctv mt-1.5 text-[11px] font-semibold"
              style={{ color: deltaColor || "#2dd4a4" }}
            >
              {delta}
            </div>
          )}
          <span
            aria-hidden
            className="absolute bottom-0 left-9 h-0.5 w-6 bg-[#E8001D]"
          />
        </div>
      ))}
    </div>
  );
}
