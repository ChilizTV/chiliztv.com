"use client";

import { Lock, Zap, Clock, TrendingUp, ArrowRight } from "lucide-react";

const METRICS = [
  {
    icon: Lock,
    label: "Wallets Locked",
    value: "—",
    sub: "On-chain",
  },
  {
    icon: Clock,
    label: "Bets to Resolve",
    value: "—",
    sub: "Pending",
  },
  {
    icon: TrendingUp,
    label: "Pool Growth",
    value: "—",
    sub: "This month",
  },
];

export function PoolStatsSection() {
  return (
    <section>
      {/* Section title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: "#E8001D" }} />
        <h2
          className="text-[22px] font-bold uppercase tracking-[0.05em] leading-none"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}
        >
          Pool
        </h2>
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "#141414",
          border: "1px solid #2A2A2A",
          boxShadow: "0 0 48px rgba(232,0,29,0.06)",
        }}
      >
        {/* Top band — red accent line */}
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg, #E8001D 0%, transparent 60%)" }} />

        <div className="flex flex-col lg:flex-row">
          {/* LEFT — Hero stat */}
          <div
            className="flex flex-col justify-between p-6 lg:p-8 lg:w-[320px] flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(232,0,29,0.07) 0%, transparent 70%)",
              borderRight: "1px solid #2A2A2A",
            }}
          >
            <div>
              <div
                className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-3"
                style={{ color: "#555" }}
              >
                Total Value Locked
              </div>
              <div
                className="font-mono font-bold leading-none mb-1"
                style={{
                  fontSize: "42px",
                  color: "#fff",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                —
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded"
                  style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.2)" }}
                >
                  <Zap size={11} style={{ color: "#F5C518" }} />
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: "#F5C518", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    APY —
                  </span>
                </div>
                <span className="text-[11px]" style={{ color: "#555" }}>Rolling 30d</span>
              </div>
            </div>

            {/* CTA */}
            <button
              className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded text-[13px] font-bold tracking-[0.08em] uppercase transition-all duration-150 group"
              style={{ background: "#E8001D", color: "#fff" }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "#B0001A";
                b.style.transform = "translateY(-1px)";
                b.style.boxShadow = "0 4px 20px rgba(232,0,29,0.35)";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "#E8001D";
                b.style.transform = "translateY(0)";
                b.style.boxShadow = "none";
              }}
            >
              Join the Pool
              <ArrowRight size={14} />
            </button>
          </div>

          {/* RIGHT — Metrics + description */}
          <div className="flex flex-col justify-between p-6 lg:p-8 flex-1">
            {/* Metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
              {METRICS.map(({ icon: Icon, label, value, sub }, i) => (
                <div
                  key={label}
                  className="flex items-start gap-3 sm:px-6"
                  style={{
                    borderLeft: i > 0 ? "1px solid #2A2A2A" : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "#1E1E1E" }}
                  >
                    <Icon size={14} style={{ color: "#555" }} />
                  </div>
                  <div>
                    <div
                      className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-1"
                      style={{ color: "#555" }}
                    >
                      {label}
                    </div>
                    <div
                      className="font-mono text-[20px] font-bold leading-none"
                      style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {value}
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: "#444" }}>
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider + description */}
            <div
              className="mt-6 pt-5"
              style={{ borderTop: "1px solid #1E1E1E" }}
            >
              <p className="text-[12px] leading-relaxed" style={{ color: "#555" }}>
                The pool is the house. Liquidity providers earn yield from every losing prediction —
                no transaction fees, no middleman. Pure on-chain mechanics.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                {["No lock-up period", "100% on-chain", "CHZ-native yield"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded"
                    style={{
                      background: "#1E1E1E",
                      color: "#888",
                      border: "1px solid #2A2A2A",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
