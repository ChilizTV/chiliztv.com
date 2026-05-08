import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative z-[4] overflow-hidden px-8 py-32 text-center sm:px-14 sm:py-36">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(232,0,29,0.15), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="font-mono-ctv mb-6 text-[11px] uppercase tracking-[0.32em] text-white/45">
          — Whistle blows at kickoff —
        </div>
        <h2
          className="font-display m-0 mb-9 font-extrabold uppercase tracking-[-0.01em]"
          style={{
            fontSize: "clamp(56px, 9vw, 108px)",
            lineHeight: 0.92,
          }}
        >
          The book is open.
          <br />
          <span className="text-[#E8001D]">Take a seat.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-[520px] text-[18px] font-light leading-[1.5] text-white/65">
          41 streams live. 12 markets open. $4.82M in the pool. The next match
          starts in 14 minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/live"
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-md bg-[#E8001D] px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737]"
            style={{ boxShadow: "0 8px 32px rgba(232,0,29,0.25)" }}
          >
            <span
              aria-hidden
              className="inline-block"
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid #fff",
                borderTop: "5px solid transparent",
                borderBottom: "5px solid transparent",
              }}
            />
            Watch live
          </Link>
          <Link
            href="/waitlist"
            className="inline-flex cursor-pointer items-center rounded-md border border-[#2A2A2A] bg-transparent px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:border-[#E8001D]"
          >
            Join waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}
