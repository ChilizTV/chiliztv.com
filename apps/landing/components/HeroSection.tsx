import Image from "next/image";
import { BackgroundFX } from "./landing/BackgroundFX";
import { SmokeBackground } from "@chiliztv/ui";
import { GateInline } from "./features/access/GateInline";

const META_LABELS = ["Streams live", "Markets open", "Volume staked", "Settled today"];

export function HeroSection() {
  return (
    <>
      <BackgroundFX />
      <section className="relative overflow-hidden min-h-svh">
        {/* Animated smoke backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
        >
          <SmokeBackground smokeColor="#E8001D" />
        </div>

        {/* Dim overlay for legibility over smoke */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.65) 60%, rgba(10,10,10,0.95) 100%)",
          }}
        />

        <header className="relative z-[4] mx-auto grid max-w-[1400px] items-center gap-12 px-8 py-14 text-white sm:px-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Left — copy */}
          <div>
            <div className="font-mono-ctv mb-7 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-white/45">
              <span className="block h-[2px] w-7 bg-[#E8001D]" />
              <span>Live · Football · On-chain</span>
            </div>

            <h1
              className="font-display mb-7 font-extrabold uppercase leading-[0.88] tracking-[-0.01em] text-white"
              style={{ fontSize: "clamp(56px, 8.5vw, 108px)" }}
            >
              Watch the
              <br />
              match.
              <br />
              <span style={{ color: "#E8001D" }}>Predict</span> the moment.
              <br />
              <span className="text-stroke-white">Earn</span> the rest.
            </h1>

            <p className="mb-9 max-w-[520px] text-[17px] font-light leading-[1.55] text-white/65">
              Betcast pairs live football streams with on-chain pari-mutuel markets.
              No bookmaker, no fixed odds — winners share the pool pro-rata,
              minus a 5% protocol fee that funds the leaderboard. Settles
              entirely on Chiliz Chain.
            </p>

            <GateInline />

            <div className="mt-12 border-t border-[#1E1E1E] pt-7">
              <div className="font-mono-ctv mb-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#E8001D]">
                <span aria-hidden className="block h-0.5 w-3 bg-[#E8001D]" />
                Beta · Live on Spicy testnet
              </div>
              <div className="flex flex-wrap gap-8">
                {META_LABELS.map((label) => (
                  <div key={label}>
                    <div className="font-mono-ctv mb-1.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {label}
                    </div>
                    <div className="font-display text-[28px] font-bold leading-none text-white/25">
                      —
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — odds card (desktop only) */}
          <Image
            src="/oddsCard.png"
            alt="Live odds — Bayern Munich vs Barcelona"
            width={1200}
            height={780}
            priority
            className="hidden w-full lg:block"
          />
        </header>
      </section>
    </>
  );
}
