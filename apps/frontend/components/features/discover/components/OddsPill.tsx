import { NumberTicker } from "@/components/ui/number-ticker";

export function OddsPill({
  label,
  value,
  accent = false,
  trend,
}: {
  label: string;
  value: number;
  accent?: boolean;
  trend?: "up" | "down";
}) {
  const trendColor =
    trend === "up" ? "#2dd4a4" : trend === "down" ? "#FF1737" : null;

  return (
    <div
      className={`font-mono-ctv flex items-center justify-between gap-2 rounded-md border px-3 py-[7px] text-[11px] font-semibold transition-colors ${
        accent ? "" : "hover:border-[#3A3A3A]"
      }`}
      style={{
        borderColor: accent ? "rgba(232,0,29,0.55)" : "#1E1E1E",
        background: accent ? "rgba(232,0,29,0.08)" : "rgba(255,255,255,0.02)",
        color: accent ? "#E8001D" : "#fff",
      }}
    >
      <span className="text-[9px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </span>
      <span style={{ color: trendColor || (accent ? "#E8001D" : "#fff") }}>
        <NumberTicker value={value} decimalPlaces={2} />
        {trend === "up" && <span className="ml-1 text-[#2dd4a4]">▲</span>}
        {trend === "down" && <span className="ml-1 text-[#FF1737]">▼</span>}
      </span>
    </div>
  );
}
