import Link from "next/link";
import { SectionHead } from "./SectionHead";

const STEPS = [
  {
    num: "▸ 01",
    title: "Connect",
    body: "Any EVM wallet. Hold fan tokens or CHZ? You qualify for pool LP tier 1 instantly.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
        <circle cx="16" cy="13" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    num: "▸ 02",
    title: "Watch",
    body: "Live football streams from creators on the network. Chat in CHZ. Tip in $TEAM.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    num: "▸ 03",
    title: "Predict",
    body: "1X2, Over/Under, BTTS — click an odd, sign once. Settled by smart contract on Chiliz.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-7" />
      </svg>
    ),
  },
  {
    num: "▸ 04",
    title: "Earn",
    body: "Win your predictions — or stake the pool to bookmake against the predictors and split every loss.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="relative z-[4] mx-auto max-w-[1400px] px-8 py-20 sm:px-14 sm:py-28">
      <SectionHead
        title={
          <>
            Stack your edge
            <br />
            in <span className="text-[#E8001D]">60 seconds.</span>
          </>
        }
        lead="Four steps from refresh-tab spectator to pool-funding LP. No KYC, no custody, no hidden cuts — your wallet is the only credential."
      />

      <div
        className="grid gap-px overflow-hidden rounded-xl border border-[#1E1E1E] sm:grid-cols-2 lg:grid-cols-4"
        style={{ background: "#1E1E1E" }}
      >
        {STEPS.map(({ num, title, body, icon }) => (
          <div
            key={title}
            className="bg-[#0A0A0A] px-8 pb-10 pt-9 transition-colors hover:bg-[#111]"
          >
            <div className="font-mono-ctv mb-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
              {num}
            </div>
            <div
              className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-[#2A2A2A] text-[#E8001D]"
            >
              {icon}
            </div>
            <h4 className="font-display mb-2.5 text-[26px] font-bold uppercase tracking-[0.01em]">
              {title}
            </h4>
            <p className="text-[14px] font-light leading-[1.55] text-white/65">
              {body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <div className="relative isolate inline-block">
          <div
            aria-hidden
            className="absolute -inset-1 animate-pulse rounded-md bg-[#E8001D]/10 blur-md"
          />
          <Link
            href="/how-it-works"
            className="font-mono-ctv group relative inline-flex items-center gap-2.5 overflow-hidden rounded-md border border-[#E8001D]/60 bg-transparent px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.06em] text-white transition-all hover:-translate-y-px hover:border-[#E8001D]"
            style={{
              boxShadow: "0 0 8px rgba(232,0,29,0.18)",
            }}
          >
            <span
              aria-hidden
              className="ctv-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/10 blur-md"
            />
            <span className="relative">Read the full guide</span>
            <span
              aria-hidden
              className="relative text-[#E8001D] transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
