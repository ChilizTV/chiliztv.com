"use client";

interface FreshPoolHeroProps {
  /** Number of markets currently open for staking. */
  marketsOpen: number;
}

/**
 * Banner shown atop the markets list when nothing is staked on the match yet.
 * Frames the empty pools as an edge ("set the opening line") rather than a
 * void. Purely presentational.
 */
export function FreshPoolHero({ marketsOpen }: FreshPoolHeroProps) {
  const stats = [
    { n: String(marketsOpen), l: "Markets open", red: false },
    { n: "0", l: "USDC staked", red: true },
    { n: "2%", l: "Settle fee", red: false },
  ];

  return (
    <div
      className="relative mb-3 flex flex-col gap-4 overflow-hidden rounded-xl border border-[#1E1E1E] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-9"
      style={{
        background: "radial-gradient(140% 160% at 0% 0%, rgba(232,0,29,0.10), transparent 52%)",
      }}
    >
      <div className="min-w-0">
        <div className="font-mono-ctv inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F5C518]">
          <span aria-hidden className="block h-0.5 w-4 bg-[#F5C518]" />
          Pools just opened
        </div>
        <h3 className="font-display mt-3 text-[clamp(26px,3.6vw,36px)] font-extrabold uppercase leading-[0.92] tracking-tight text-white">
          Nobody&apos;s called it yet. <span className="text-[#E8001D]">Set the line.</span>
        </h3>
        <p className="mt-3 max-w-[56ch] text-[14px] leading-relaxed text-white/65">
          Be the first to predict and lock the opening position. In a pari-mutuel pool,{" "}
          <b className="font-medium text-white">early calls ride the best implied odds</b> — your
          edge shrinks as the crowd piles in.
        </p>
      </div>
      <div className="flex flex-none gap-2.5">
        {stats.map((s) => (
          <div
            key={s.l}
            className="flex min-w-[86px] flex-1 flex-col gap-1.5 rounded-xl border border-[#1E1E1E] bg-[#141414] px-4 py-3.5 sm:flex-none"
          >
            <span
              className={`font-display text-[28px] font-extrabold leading-none tracking-tight ${
                s.red ? "text-[#E8001D]" : "text-white"
              }`}
            >
              {s.n}
            </span>
            <span className="font-mono-ctv text-[9px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {s.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
