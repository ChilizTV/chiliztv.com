"use client";

import { Users, Lock, Clock, TrendingUp } from "lucide-react";

const STATS = [
  {
    icon: TrendingUp,
    label: "Total Value Locked",
    value: "—",
    sub: "On-chain",
    valueColor: "#fff",
  },
  {
    icon: Lock,
    label: "Wallets Locked",
    value: "—",
    sub: "On-chain",
    valueColor: "#fff",
  },
  {
    icon: Clock,
    label: "Bets to Resolve",
    value: "—",
    sub: "Pending",
    valueColor: "#FFB300",
  },
  {
    icon: Users,
    label: "APY",
    value: "—",
    sub: "Rolling 30d",
    valueColor: "#F5C518",
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
        className="rounded-lg p-5"
        style={{ background: "#141414", border: "1px solid #2A2A2A" }}
      >
        <div className="flex flex-wrap gap-0">
          {STATS.map(({ icon: Icon, label, value, sub, valueColor }, i) => (
            <div
              key={label}
              className="flex items-center gap-4 flex-1 min-w-[160px] py-3 px-5"
              style={{
                borderRight: i < STATS.length - 1 ? "1px solid #2A2A2A" : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: "#1E1E1E" }}
              >
                <Icon size={16} style={{ color: "#888" }} />
              </div>
              <div>
                <div
                  className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1"
                  style={{ color: "#555" }}
                >
                  {label}
                </div>
                <div
                  className="font-mono text-[22px] font-bold leading-none"
                  style={{ color: valueColor, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {value}
                </div>
                <div className="text-[10px] mt-1" style={{ color: "#555" }}>
                  {sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between mt-5 pt-4"
          style={{ borderTop: "1px solid #2A2A2A" }}
        >
          <p className="text-[12px]" style={{ color: "#888" }}>
            Liquidity providers earn yield from mispredicted bets. No transaction fees.
          </p>
          <button
            className="flex-shrink-0 px-5 py-2 rounded text-[12px] font-bold tracking-[0.08em] uppercase transition-colors duration-150"
            style={{ background: "#E8001D", color: "#fff" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#B0001A")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#E8001D")}
          >
            Join the Pool
          </button>
        </div>
      </div>
    </section>
  );
}
