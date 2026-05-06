"use client";

import { useState } from "react";
import { formatUnits, type Address } from "viem";
import { Lock, Zap, Activity, TrendingUp, ArrowRight } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useLiquidityPool } from "@/hooks/useLiquidityPool";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { chilizConfig } from "@/config/chiliz.config";
import { PoolDepositDialog } from "./PoolDepositDialog";

function formatUsdc(value: bigint | undefined, decimals: number | undefined, fractionDigits = 0): string {
  if (value === undefined || decimals === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatUtilization(util: bigint | undefined): string {
  if (util === undefined) return "—";
  const pct = Number(util) / 1e16;
  return `${pct.toFixed(1)}%`;
}

function formatBps(bps: number | undefined): string {
  if (bps === undefined) return "—";
  return `${(bps / 100).toFixed(2)}%`;
}

export function PoolStatsSection() {
  const poolAddress = chilizConfig.liquidityPool;
  const { primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address | undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  const { stats, isLoadingStats } = useLiquidityPool(poolAddress, userAddress);
  const { assetDecimals } = usePoolDecimals();

  const poolUnconfigured =
    poolAddress === "0x0000000000000000000000000000000000000000";

  const tvl = formatUsdc(stats.totalAssets, assetDecimals, 0);
  const liabilities = formatUsdc(stats.totalLiabilities, assetDecimals, 0);
  const free = formatUsdc(stats.freeBalance, assetDecimals, 0);

  const metrics = [
    {
      icon: Lock,
      label: "Locked Liability",
      value: poolUnconfigured ? "—" : isLoadingStats ? "…" : liabilities,
      sub: "Open bets",
    },
    {
      icon: Activity,
      label: "Utilization",
      value: poolUnconfigured ? "—" : isLoadingStats ? "…" : formatUtilization(stats.utilization),
      sub: "Of TVL",
    },
    {
      icon: TrendingUp,
      label: "Free Balance",
      value: poolUnconfigured ? "—" : isLoadingStats ? "…" : free,
      sub: "Available",
    },
  ];

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: "#E8001D" }} />
        <h2
          className="text-[22px] font-bold uppercase tracking-[0.05em] leading-none"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}
        >
          Pool
        </h2>
        {stats.isPaused && (
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-[0.1em]"
            style={{ background: "rgba(245,197,24,0.12)", color: "#F5C518" }}
          >
            Paused
          </span>
        )}
      </div>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "#141414",
          border: "1px solid #2A2A2A",
          boxShadow: "0 0 48px rgba(232,0,29,0.06)",
        }}
      >
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
                {poolUnconfigured ? "—" : isLoadingStats ? "…" : `$${tvl}`}
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
                    Fee {formatBps(stats.protocolFeeBps)}
                  </span>
                </div>
                <span className="text-[11px]" style={{ color: "#555" }}>Protocol</span>
              </div>
            </div>

            <button
              onClick={() => setDialogOpen(true)}
              disabled={poolUnconfigured}
              className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded text-[13px] font-bold tracking-[0.08em] uppercase transition-all duration-150 group"
              style={{
                background: poolUnconfigured ? "#3A3A3A" : "#E8001D",
                color: "#fff",
                cursor: poolUnconfigured ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (poolUnconfigured) return;
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "#B0001A";
                b.style.transform = "translateY(-1px)";
                b.style.boxShadow = "0 4px 20px rgba(232,0,29,0.35)";
              }}
              onMouseLeave={(e) => {
                if (poolUnconfigured) return;
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = "#E8001D";
                b.style.transform = "translateY(0)";
                b.style.boxShadow = "none";
              }}
            >
              {poolUnconfigured ? "Pool unavailable" : "Join the Pool"}
              {!poolUnconfigured && <ArrowRight size={14} />}
            </button>
          </div>

          {/* RIGHT — Metrics + description */}
          <div className="flex flex-col justify-between p-6 lg:p-8 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
              {metrics.map(({ icon: Icon, label, value, sub }, i) => (
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

            <div
              className="mt-6 pt-5"
              style={{ borderTop: "1px solid #1E1E1E" }}
            >
              <p className="text-[12px] leading-relaxed" style={{ color: "#555" }}>
                The pool is the house. Liquidity providers earn yield from every losing prediction —
                no transaction fees, no middleman. Pure on-chain mechanics.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                {["No lock-up period", "100% on-chain", "USDC yield"].map((tag) => (
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

      <PoolDepositDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </section>
  );
}
