import { Eyebrow } from "../components";

export interface HeroStat {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function DiscoverHero({ stats }: { stats: HeroStat[] }) {
  return (
    <section className="relative z-[4] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 30% 30%, rgba(232,0,29,0.10), transparent 60%)",
        }}
      />
      <div className="mx-auto grid max-w-[1400px] items-end gap-12 px-8 py-16 sm:px-14 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <div className="mb-7">
            <Eyebrow dim>Live · Discover · Match center</Eyebrow>
          </div>
          <h1
            className="font-display mb-7 font-extrabold uppercase leading-[0.88] tracking-[-0.01em] text-white"
            style={{ fontSize: "clamp(52px, 7.5vw, 96px)" }}
          >
            Browse the
            <br />
            <span style={{ color: "#E8001D" }}>action</span>.
            <br />
            <span className="text-stroke-white">Pick</span> your moment.
          </h1>
          <p className="max-w-[540px] text-[17px] font-light leading-[1.55] text-white/65">
            Every fixture is a smart-contract market on Chiliz Chain. Stream
            the match, scan the order book, predict before the whistle. The
            pool is the house, your fan tokens are the bookmaker.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#explorer"
              className="inline-flex cursor-pointer items-center gap-[10px] rounded-md bg-[#E8001D] px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737]"
              style={{ boxShadow: "0 8px 32px rgba(232,0,29,0.25)" }}
            >
              <span
                aria-hidden
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid #fff",
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                }}
              />
              Watch live
            </a>
            <a
              href="#pool"
              className="inline-flex cursor-pointer items-center rounded-md border border-[#2A2A2A] bg-transparent px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:border-[#E8001D]"
            >
              Join the pool
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, sub, accent }, i) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] p-6 transition-colors hover:border-[#2A2A2A]"
              style={{ minHeight: 144 }}
            >
              <div className="font-mono-ctv mb-3 text-[10px] uppercase tracking-[0.16em] text-white/45">
                {label}
              </div>
              <div
                className="font-display text-[44px] font-extrabold leading-none tracking-[-0.02em]"
                style={{ color: accent ? "#E8001D" : "#fff" }}
              >
                {value}
              </div>
              {sub && (
                <div className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.14em] text-white/45">
                  {sub}
                </div>
              )}
              <span
                aria-hidden
                className="absolute bottom-0 left-6 h-0.5 w-6"
                style={{ background: i === 0 ? "#E8001D" : "#1E1E1E" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
