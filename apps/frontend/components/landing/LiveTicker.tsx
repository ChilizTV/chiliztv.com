type TickerItem =
  | { kind: "live"; min: string; match: string; odds: string }
  | { kind: "upcoming"; time: string; match: string; odds: string };

const ITEMS: TickerItem[] = [
  { kind: "live", min: "67'", match: "PSG 2-1 BAR", odds: "1.42 / 4.10 / 5.80" },
  { kind: "live", min: "23'", match: "JUV 0-0 ACM", odds: "2.10 / 3.20 / 3.40" },
  { kind: "live", min: "54'", match: "CITY 1-0 AFC", odds: "1.62 / 4.00 / 5.20" },
  { kind: "upcoming", time: "21:00", match: "NAP vs ATM", odds: "2.30 / 3.10 / 3.20" },
  { kind: "upcoming", time: "21:45", match: "MENGO vs SPURS", odds: "1.85 / 3.40 / 4.10" },
];

function Item({ item }: { item: TickerItem }) {
  return (
    <span className="inline-flex items-center gap-3">
      {item.kind === "live" ? (
        <span className="inline-flex items-center gap-1.5 font-bold text-[#E8001D]">
          <span className="ctv-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#E8001D]" />
          LIVE
        </span>
      ) : (
        <span>{item.time}</span>
      )}
      <span className="font-bold text-[#E8001D]">{item.match}</span>
      {item.kind === "live" && <span>{item.min}</span>}
      <span className="text-[#2A2A2A]">·</span>
      <span>{item.odds}</span>
    </span>
  );
}

export function LiveTicker() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div
      className="relative z-[4] overflow-hidden border-y border-[#1E1E1E] bg-[#111] py-[14px]"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
      }}
      aria-label="Live matches ticker"
    >
      <div
        className="ctv-marquee font-mono-ctv flex gap-12 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.06em] text-white/65"
        role="marquee"
      >
        {loop.map((item, i) => (
          <Item key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
