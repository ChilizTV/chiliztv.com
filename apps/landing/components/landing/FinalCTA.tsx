import { GateInline } from "@/components/features/access/GateInline";

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
          The pools are open.
          <br />
          <span className="text-[#E8001D]">Take your side.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-[520px] text-[18px] font-light leading-[1.5] text-white/65">
          Join the waitlist or enter your access code to get in.
        </p>
        <GateInline centered />
      </div>
    </section>
  );
}
