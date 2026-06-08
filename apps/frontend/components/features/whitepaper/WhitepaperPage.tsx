"use client";

import { FileText, Clock } from "lucide-react";

const SECTIONS = [
  { title: "Introduction", anchor: "introduction" },
  { title: "Protocol Overview", anchor: "overview" },
  { title: "Tokenomics", anchor: "tokenomics" },
  { title: "Prediction Markets", anchor: "predictions" },
  { title: "Streaming & SocialFi", anchor: "streaming" },
  { title: "Liquidity Pool", anchor: "liquidity" },
  { title: "Governance", anchor: "governance" },
  { title: "Roadmap", anchor: "roadmap" },
  { title: "Team", anchor: "team" },
];

export function WhitepaperPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#0A0A0A", fontFamily: "'Lexend', sans-serif" }}
    >
      {/* Hero band */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0A0A0A 0%, #1a0005 50%, #0A0A0A 100%)",
          borderBottom: "1px solid #1E1E1E",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ background: "rgba(232,0,29,0.15)", border: "1px solid rgba(232,0,29,0.3)" }}
            >
              <FileText size={20} style={{ color: "#E8001D" }} />
            </div>
            <span
              className="text-[11px] font-bold tracking-[0.16em] uppercase"
              style={{ color: "#E8001D" }}
            >
              PredCast Whitepaper
            </span>
          </div>

          <h1
            className="text-[48px] sm:text-[64px] font-black leading-[0.95] text-white mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            The Future of
            <br />
            <span style={{ color: "#E8001D" }}>Sports SocialFi</span>
          </h1>

          <p className="text-[17px] text-white/60 max-w-xl leading-relaxed">
            A comprehensive overview of the PredCast protocol — prediction markets,
            live streaming, on-chain liquidity, and fan-first economics.
          </p>

          <div
            className="inline-flex items-center gap-2 mt-8 px-4 py-2 rounded-full"
            style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)" }}
          >
            <Clock size={13} style={{ color: "#F5C518" }} />
            <span className="text-[12px] font-semibold" style={{ color: "#F5C518" }}>
              Coming Soon — Full whitepaper in progress
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-16 flex flex-col lg:flex-row gap-12">

        {/* Sidebar TOC */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <p
              className="text-[10px] font-bold tracking-[0.14em] uppercase mb-4"
              style={{ color: "#555" }}
            >
              Table of Contents
            </p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.anchor}
                  href={`#${s.anchor}`}
                  className="text-[13px] py-1.5 px-3 rounded transition-colors duration-150"
                  style={{ color: "#666" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                    (e.currentTarget as HTMLAnchorElement).style.background = "#1A1A1A";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#666";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {SECTIONS.map((s) => (
            <section
              key={s.anchor}
              id={s.anchor}
              className="mb-16 scroll-mt-24"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-1 h-6 rounded-full flex-shrink-0"
                  style={{ background: "#E8001D" }}
                />
                <h2
                  className="text-[22px] font-bold uppercase tracking-[0.05em] leading-none"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}
                >
                  {s.title}
                </h2>
              </div>

              {/* Placeholder block */}
              <div
                className="rounded-lg p-8 flex flex-col items-center justify-center text-center"
                style={{
                  background: "#111",
                  border: "1px solid #1E1E1E",
                  minHeight: "140px",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                >
                  <Clock size={14} style={{ color: "#444" }} />
                </div>
                <p className="text-[13px]" style={{ color: "#444" }}>
                  Content coming soon
                </p>
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
