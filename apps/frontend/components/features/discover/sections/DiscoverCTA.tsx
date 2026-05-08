import { Eyebrow } from "../components";

export function DiscoverCTA({
  liveCount,
  marketsOpen,
  tvl,
}: {
  liveCount: number;
  marketsOpen: number;
  tvl: string;
}) {
  return (
    <section
      className="relative z-[4] overflow-hidden border-y border-[#1E1E1E]"
      style={{
        background:
          "linear-gradient(180deg, #0A0A0A 0%, #111 50%, #0A0A0A 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 50% 50%, rgba(232,0,29,0.18), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 px-8 py-16 sm:px-14 sm:py-20 lg:flex-row lg:items-center">
        <div className="max-w-[640px]">
          <div className="mb-5">
            <Eyebrow dim>— Whistle blows at kickoff —</Eyebrow>
          </div>
          <h2
            className="font-display m-0 mb-6 font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-white"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            The book is open.
            <br />
            <span className="text-[#E8001D]">Take a seat.</span>
          </h2>
          <p className="max-w-[480px] text-[16px] font-light leading-[1.55] text-white/65">
            {liveCount} streams live · {marketsOpen} markets open · {tvl} in
            the pool. The next match starts soon.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            href="/waitlist"
            className="inline-flex cursor-pointer items-center rounded-md border border-[#2A2A2A] bg-transparent px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:border-[#E8001D]"
          >
            Join waitlist
          </a>
        </div>
      </div>
    </section>
  );
}
