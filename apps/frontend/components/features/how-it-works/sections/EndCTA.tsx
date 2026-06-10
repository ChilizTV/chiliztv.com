import Link from "next/link";

import { SHELL } from "../components/ChapterShell";

export function EndCTA() {
  return (
    <section className="relative overflow-hidden border-t border-[#1E1E1E] py-30 md:py-35">
      <div
        aria-hidden
        className="font-display pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 font-black uppercase whitespace-nowrap text-[#E8001D]"
        style={{
          fontSize: "clamp(280px, 36vw, 520px)",
          lineHeight: 0.85,
          letterSpacing: "-0.05em",
          opacity: 0.12,
        }}
      >
        Play
      </div>
      <div className={SHELL}>
        <div className="relative z-2 max-w-190">
          <h2
            className="font-display m-0 mb-9 font-black uppercase text-white"
            style={{
              fontSize: "clamp(64px, 9vw, 140px)",
              lineHeight: 0.86,
              letterSpacing: "-0.025em",
            }}
          >
            Ready to <span className="text-[#E8001D]">play?</span>
          </h2>
          <p className="m-0 mb-10 max-w-135 text-[18px] font-light leading-[1.55] text-white/65">
            The app is live — jump in and take your side.
          </p>
          <Link
            href="/browse"
            className="font-mono-ctv inline-block rounded-md bg-[#E8001D] px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737]"
            style={{ boxShadow: "0 8px 32px rgba(232,0,29,0.25)" }}
          >
            Browse matches
          </Link>
        </div>
      </div>
    </section>
  );
}
