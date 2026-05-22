type Row = {
  name: string;
  crestBg: string;
  crestLabel: string;
  prob: string;
  probTrend?: "up" | "down";
  pool: string;
  share: number;
};

const PRIMARY: Row[] = [
  {
    name: "PSG win",
    crestBg: "linear-gradient(135deg,#004170,#001a2e)",
    crestLabel: "P",
    prob: "62% ▲",
    probTrend: "up",
    pool: "$84.2K",
    share: 62,
  },
  {
    name: "Draw",
    crestBg: "#444",
    crestLabel: "=",
    prob: "9%",
    pool: "$12.5K",
    share: 9,
  },
  {
    name: "BAR win",
    crestBg: "linear-gradient(135deg,#a50044,#4a001f)",
    crestLabel: "B",
    prob: "29% ▼",
    probTrend: "down",
    pool: "$31.8K",
    share: 23,
  },
];

const SECONDARY: Row[] = [
  {
    name: "Over 2.5",
    crestBg: "#E8001D",
    crestLabel: "⌃",
    prob: "54% ▲",
    probTrend: "up",
    pool: "$56.0K",
    share: 54,
  },
  {
    name: "Under 2.5",
    crestBg: "#2A2A2A",
    crestLabel: "⌄",
    prob: "25%",
    pool: "$18.4K",
    share: 25,
  },
  {
    name: "BTTS · Yes",
    crestBg: "linear-gradient(135deg,#E8001D,#7a0010)",
    crestLabel: "★",
    prob: "48% ▲",
    probTrend: "up",
    pool: "$42.1K",
    share: 48,
  },
];

function BookRow({ row, dashedTop }: { row: Row; dashedTop?: boolean }) {
  const probColor =
    row.probTrend === "up"
      ? "#2dd4a4"
      : row.probTrend === "down"
        ? "#FF1737"
        : "#fff";
  return (
    <div
      className="font-mono-ctv grid items-center gap-1 rounded-md px-3 py-[9px] text-[12px] font-semibold transition-colors hover:bg-[rgba(232,0,29,0.06)]"
      style={{
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        marginTop: dashedTop ? 8 : 0,
        borderTop: dashedTop ? "1px dashed #1E1E1E" : undefined,
        paddingTop: dashedTop ? 14 : 9,
      }}
    >
      <div className="flex items-center gap-2 text-white">
        <span
          className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[8px] font-extrabold text-white"
          style={{ background: row.crestBg }}
        >
          {row.crestLabel}
        </span>
        {row.name}
      </div>
      <div
        className="text-right text-[13px]"
        style={{ color: probColor }}
      >
        {row.prob}
      </div>
      <div className="text-right text-[11px] text-white/45">{row.pool}</div>
      <div className="pl-2 text-right">
        <span className="relative inline-block h-[4px] w-full overflow-hidden rounded-sm bg-[#1E1E1E]">
          <span
            className="absolute inset-y-0 left-0 rounded-sm"
            style={{ width: `${row.share}%`, background: "#E8001D" }}
          />
        </span>
      </div>
    </div>
  );
}

export function OrderBookCard() {
  return (
    <div className="relative w-full">
      {/* Corner brackets */}
      <span
        aria-hidden
        className="absolute h-4 w-4"
        style={{
          top: -6,
          left: -6,
          borderTop: "1px solid #E8001D",
          borderLeft: "1px solid #E8001D",
        }}
      />
      <span
        aria-hidden
        className="absolute h-4 w-4"
        style={{
          top: -6,
          right: -6,
          borderTop: "1px solid #E8001D",
          borderRight: "1px solid #E8001D",
        }}
      />
      <span
        aria-hidden
        className="absolute h-4 w-4"
        style={{
          bottom: -6,
          left: -6,
          borderBottom: "1px solid #E8001D",
          borderLeft: "1px solid #E8001D",
        }}
      />
      <span
        aria-hidden
        className="absolute h-4 w-4"
        style={{
          bottom: -6,
          right: -6,
          borderBottom: "1px solid #E8001D",
          borderRight: "1px solid #E8001D",
        }}
      />

      <div
        className="relative overflow-hidden rounded-xl border border-[#2A2A2A] p-6 backdrop-blur-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
          boxShadow:
            "0 30px 80px -20px rgba(232,0,29,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Top hairline gradient */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, #E8001D, transparent)",
          }}
        />

        {/* Header */}
        <div className="mb-[18px] flex items-center justify-between border-b border-[#1E1E1E] pb-[14px]">
          <div className="font-display flex items-center gap-2 text-[18px] font-bold uppercase tracking-[0.02em]">
            PSG <span className="mx-1 font-medium text-white/45">vs</span> BAR
            <span className="font-mono-ctv ml-1 text-[11px] font-semibold text-[#E8001D]">
              67&apos;
            </span>
          </div>
          <span
            className="font-mono-ctv inline-flex items-center gap-2 rounded-full border px-3 py-[6px] text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]"
            style={{
              background: "rgba(232,0,29,0.08)",
              borderColor: "rgba(232,0,29,0.4)",
            }}
          >
            <span
              className="ctv-pulse-dot inline-block h-[6px] w-[6px] rounded-full bg-[#E8001D]"
              style={{ boxShadow: "0 0 10px #E8001D" }}
            />
            Live · 2-1
          </span>
        </div>

        {/* Column labels */}
        <div
          className="font-mono-ctv mb-[6px] grid gap-1 px-3 text-[9px] uppercase tracking-[0.14em] text-white/45"
          style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}
        >
          <span>Outcome</span>
          <span className="text-right">Implied %</span>
          <span className="text-right">Pool</span>
          <span className="text-right">Share</span>
        </div>

        {PRIMARY.map((r) => (
          <BookRow key={r.name} row={r} />
        ))}
        {SECONDARY.map((r, i) => (
          <BookRow key={r.name} row={r} dashedTop={i === 0} />
        ))}

        {/* Footer */}
        <div className="font-mono-ctv mt-[14px] flex items-center justify-between border-t border-[#1E1E1E] pt-3 text-[10px] text-white/45">
          <span>$245.0K staked · 3 markets</span>
          <span className="flex items-center gap-[6px]">
            <span className="ctv-pulse-dot inline-block h-[6px] w-[6px] rounded-full bg-[#E8001D]" />
            <span className="text-[#2dd4a4]">block 8,492,134</span>
          </span>
        </div>
      </div>
    </div>
  );
}
