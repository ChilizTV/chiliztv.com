"use client";

interface DurationOption {
  months: number;
  label: string;
  sub: string;
  badge?: string;
}

const OPTIONS: DurationOption[] = [
  { months: 1, label: "1 month", sub: "Monthly" },
  { months: 3, label: "3 months", sub: "Quarterly" },
  { months: 6, label: "6 months", sub: "Semi-annual" },
  { months: 12, label: "12 months", sub: "Annual", badge: "Best value" },
];

interface DurationGridProps {
  months: number;
  monthlyUsd: number;
  onPick: (months: number) => void;
}

const fmtUsd = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 2×2 duration cards (1 / 3 / 6 / 12 months) with a "Best value" badge. */
export function DurationGrid({ months, monthlyUsd, onPick }: DurationGridProps) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {OPTIONS.map((d) => {
        const active = d.months === months;
        return (
          <button
            key={d.months}
            type="button"
            onClick={() => onPick(d.months)}
            className="relative rounded-xl border px-3 py-3 text-left transition-colors"
            style={{
              borderColor: active ? "#E8001D" : "#262626",
              background: active ? "rgba(232,0,29,0.10)" : "#161616",
            }}
          >
            {d.badge && (
              <span className="font-mono-ctv absolute -top-2 right-2 rounded-md border border-[#F5C518]/40 bg-[#F5C518]/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-[#F5C518]">
                {d.badge}
              </span>
            )}
            <div
              className="font-display text-[16px] font-extrabold text-white"
              style={{ lineHeight: 1 }}
            >
              {d.label}
            </div>
            <div className="font-mono-ctv mt-1 text-[9px] uppercase tracking-[0.18em] text-white/45">
              {d.sub}
            </div>
            <div className="font-mono-ctv mt-3 text-[12px] font-bold tabular-nums text-white">
              {fmtUsd(monthlyUsd * d.months)}
              <span className="font-medium text-white/40"> · {fmtUsd(monthlyUsd)}/mo</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
