import { SHELL } from "../components/ChapterShell";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#1E1E1E]">
      <div className={SHELL}>
        <div className="relative py-25 md:py-35">
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
            Cast
          </div>

          <div
            aria-hidden
            className="font-display pointer-events-none absolute top-1/2 right-0 z-1 -translate-y-1/2 font-black uppercase text-[#E8001D]"
            style={{
              fontSize: "clamp(180px, 30vw, 350px)",
              lineHeight: 0.85,
              letterSpacing: "-0.05em",
              opacity: 0.95,
            }}
          >
            00
          </div>

          <div className="relative z-2 max-w-180">
            <div className="font-mono-ctv mb-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8001D]">
              <span aria-hidden className="block h-0.5 w-8 bg-[#E8001D]" />
              Newcomer&apos;s guide
            </div>
            <h1
              className="font-display m-0 mb-8 font-black uppercase text-white"
              style={{
                fontSize: "clamp(72px, 11vw, 160px)",
                lineHeight: 0.84,
                letterSpacing: "-0.025em",
              }}
            >
              New to
              <br />
              PredCast?
              <br />
              <span className="text-[#E8001D]">Start</span>{" "}
              <span
                style={{
                  WebkitTextStroke: "1.5px #fff",
                  WebkitTextFillColor: "transparent",
                }}
              >
                here.
              </span>
            </h1>
            <p className="m-0 mb-10 max-w-135 text-[18px] font-light leading-[1.55] text-white/65">
              Predict live football, stream matches yourself, and earn from the on-chain liquidity pool. The full picture — in under five minutes.
            </p>
            <p className="font-mono-ctv text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              03 sections — 05 min read — no crypto experience required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
