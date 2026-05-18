"use client";

import { useState } from "react";
import { formatUnits, type Address } from "viem";
import { Info } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useLiquidityPool } from "@/hooks/useLiquidityPool";
import { useLpPosition, formatCooldown } from "@/hooks/useLpPosition";
import { usePoolApy, formatApy } from "@/hooks/api/usePoolApy";
import { usePoolDecimals } from "@/hooks/usePoolDecimals";
import { chilizConfig } from "@/config/chiliz.config";
import { PoolDepositDialog } from "../components";
import { SectionHead } from "./SectionHead";

/** Static, design-spec values used as visual fallbacks while the pool is
 *  being read on-chain (or when the pool address is not yet configured). */
const POOL_DESIGN_FALLBACK = {
  tvl: "$4.82M",
  liability: "$1.94M",
  utilization: "40.2%",
  free: "$2.88M",
  feeBps: 25,
} as const;

function fmtUsdc(value: bigint | undefined, decimals: number | undefined): string | null {
  if (value === undefined || decimals === undefined) return null;
  const n = Number(formatUnits(value, decimals));
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtUsdcExact(value: bigint | undefined, decimals: number | undefined, frac = 2): string {
  if (value === undefined || decimals === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: frac, maximumFractionDigits: frac })}`;
}

function fmtPct(util: bigint | undefined): string | null {
  if (util === undefined) return null;
  return `${(Number(util) / 1e16).toFixed(1)}%`;
}

interface PoolDataView {
  tvl: string;
  liability: string;
  utilization: string;
  free: string;
  feeBps: number;
  apyLabel: string;
  apyNoisy: boolean;
  apyAvailable: boolean;
}

function usePoolView(): { data: PoolDataView; configured: boolean } {
  const poolAddress = chilizConfig.liquidityPool;
  const { primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address | undefined;
  const { stats } = useLiquidityPool(poolAddress, userAddress);
  const { assetDecimals } = usePoolDecimals();
  const { data: apyData } = usePoolApy();

  const configured =
    poolAddress !== "0x0000000000000000000000000000000000000000";

  // Prefer the longer 30-day window for the headline number — smoother.
  const headline = apyData?.apy30d ?? apyData?.apy7d ?? null;

  const data: PoolDataView = {
    tvl: fmtUsdc(stats.totalAssets, assetDecimals) ?? POOL_DESIGN_FALLBACK.tvl,
    liability:
      fmtUsdc(stats.totalLiabilities, assetDecimals) ??
      POOL_DESIGN_FALLBACK.liability,
    utilization:
      fmtPct(stats.utilization) ?? POOL_DESIGN_FALLBACK.utilization,
    free:
      fmtUsdc(stats.freeBalance, assetDecimals) ?? POOL_DESIGN_FALLBACK.free,
    feeBps: stats.protocolFeeBps ?? POOL_DESIGN_FALLBACK.feeBps,
    apyLabel: formatApy(headline),
    apyNoisy: headline?.noisy ?? false,
    apyAvailable: headline !== null,
  };

  return { data, configured };
}

export function PoolPanel() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data } = usePoolView();
  const { primaryWallet } = useDynamicContext();
  const userAddress = primaryWallet?.address as Address | undefined;

  return (
    <>
      <section
        id="pool"
        className="relative z-[4] mx-auto max-w-[1400px] px-8 pb-20 pt-20 sm:px-14 sm:pb-28 sm:pt-28"
      >
        <SectionHead
          eyebrow="Liquidity · USDC · On-chain"
          title={
            <>
              The pool is
              <br />
              <span className="text-[#E8001D]">the house.</span>
            </>
          }
          lead="Liquidity providers earn yield from every losing prediction. No transaction fees, no middleman — just on-chain mechanics on Chiliz Chain."
        />
        <PoolBento data={data} onJoin={() => setDialogOpen(true)} />
        {userAddress && <YourLpPosition userAddress={userAddress} />}
      </section>
      <PoolDepositDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}

/**
 * Bottom strip of cards rendered only when the connected wallet holds shares.
 * Pulls cost basis, unrealized gain, withdrawal fee preview, and cooldown
 * countdown from `useLpPosition`. Hidden entirely (not rendered greyed-out)
 * when shares is 0 — keeps the panel uncluttered for non-LP visitors.
 */
function YourLpPosition({ userAddress }: { userAddress: Address }) {
  const { assetDecimals } = usePoolDecimals();
  const {
    shares,
    assetsValue,
    costBasis,
    unrealizedGain,
    withdrawalFeePreview,
    cooldownRemainingSec,
    canWithdraw,
  } = useLpPosition(userAddress);

  // Render nothing while loading or when the user has no position.
  if (shares === undefined || shares === BigInt(0)) return null;

  const gainPositive = unrealizedGain !== undefined && unrealizedGain > BigInt(0);

  return (
    <div className="mt-12">
      <div className="font-mono-ctv mb-4 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
        <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
        Your LP position
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PositionCard
          label="Your stake"
          value={fmtUsdcExact(assetsValue, assetDecimals)}
          sub="USDC value"
        />
        <PositionCard
          label="Cost basis"
          value={fmtUsdcExact(costBasis, assetDecimals)}
          sub="Total deposited"
        />
        <PositionCard
          label="Unrealized gain"
          value={fmtUsdcExact(unrealizedGain, assetDecimals)}
          sub={
            gainPositive && withdrawalFeePreview !== undefined
              ? `~${fmtUsdcExact(withdrawalFeePreview, assetDecimals)} fee on exit`
              : "Flat or losing — no fee on exit"
          }
          valueColor={gainPositive ? "#2dd4a4" : undefined}
        />
        <PositionCard
          label={canWithdraw ? "Withdraw" : "Cooldown"}
          value={canWithdraw ? "Unlocked" : formatCooldown(cooldownRemainingSec)}
          sub={canWithdraw ? "Ready to withdraw" : "Until next withdrawal"}
          valueColor={canWithdraw ? "#2dd4a4" : "#F5C518"}
        />
      </div>
    </div>
  );
}

function PositionCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#111] p-5">
      <div className="font-mono-ctv mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
        {label}
      </div>
      <div
        className="font-display text-[24px] font-extrabold leading-none tracking-[-0.02em]"
        style={{ color: valueColor ?? "#fff" }}
      >
        {value}
      </div>
      {sub && (
        <div className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.12em] text-white/40">
          {sub}
        </div>
      )}
    </div>
  );
}

function PoolMetric({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="font-mono-ctv mb-3 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
        <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
        {label}
      </div>
      <div
        className="font-display text-[40px] font-extrabold leading-none tracking-[-0.02em]"
        style={{ color: valueColor || "#fff" }}
      >
        {value}
      </div>
      {sub && (
        <div className="font-mono-ctv mt-2 text-[10px] uppercase tracking-[0.14em] text-white/45">
          {sub}
        </div>
      )}
    </div>
  );
}

function PoolBento({
  data,
  onJoin,
}: {
  data: PoolDataView;
  onJoin: () => void;
}) {
  return (
    <div className="grid auto-rows-auto grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-[200px] lg:grid-cols-6">
      {/* Hero TVL — 4×2 */}
      <div
        className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] p-6 sm:p-9 sm:col-span-2 lg:col-span-4 lg:row-span-2"
        style={{
          background: "linear-gradient(135deg, #111, #0A0A0A)",
        }}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, #E8001D, transparent)",
          }}
        />
        <div className="font-mono-ctv mb-4 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8001D]">
          <span aria-hidden className="block h-0.5 w-4 bg-[#E8001D]" />
          Total Value Locked
        </div>
        <div
          className="font-display text-white"
          style={{
            fontSize: "clamp(48px, 12vw, 96px)",
            lineHeight: 0.92,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          {data.tvl}
        </div>
        <p className="mt-4 max-w-[460px] text-[14px] font-light leading-[1.55] text-white/65 sm:mt-5 sm:text-[15px]">
          Stake USDC. Bookmake against every predictor on the platform. Yield
          accrues block-by-block as wagers settle.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-9">
          <button
            type="button"
            onClick={onJoin}
            className="inline-flex cursor-pointer items-center gap-[10px] rounded-md bg-[#E8001D] px-6 py-3.5 text-[13px] font-bold uppercase tracking-[0.06em] text-white transition-all hover:-translate-y-px hover:bg-[#FF1737]"
            style={{ boxShadow: "0 8px 32px rgba(232,0,29,0.25)" }}
          >
            Join the pool
            <span aria-hidden>→</span>
          </button>
          <span className="font-mono-ctv inline-flex items-center gap-2 rounded-md border border-[#1E1E1E] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[#F5C518]">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-[#F5C518]"
            />
            Protocol fee {(data.feeBps / 100).toFixed(2)}%
          </span>
          <span
            className="font-mono-ctv inline-flex items-center gap-2 rounded-md border border-[#1E1E1E] px-3 py-2 text-[10px] uppercase tracking-[0.14em]"
            style={{ color: data.apyAvailable ? "#2dd4a4" : "#666" }}
            title={
              data.apyAvailable
                ? data.apyNoisy
                  ? "APY may be noisy — large deposit/withdraw inside the window."
                  : "Trailing 30-day APY computed from on-chain price-per-share."
                : "APY unavailable — needs at least 7 days of pool history."
            }
          >
            APY {data.apyLabel}
            {data.apyAvailable && <span className="text-[9px] opacity-60">· trailing 30d</span>}
            {data.apyNoisy && <Info size={10} className="opacity-60" aria-hidden />}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] p-7 transition-colors hover:border-[#2A2A2A] sm:col-span-1 lg:col-span-2">
        <PoolMetric
          label="Locked liability"
          value={data.liability}
          sub="Open predictions · USDC"
        />
      </div>
      <div className="relative overflow-hidden rounded-xl border border-[#1E1E1E] bg-[#111] p-7 transition-colors hover:border-[#2A2A2A] sm:col-span-1 lg:col-span-2">
        <PoolMetric
          label="Utilization"
          value={data.utilization}
          sub="Of TVL deployed"
          valueColor="#E8001D"
        />
        <div className="mt-5 h-1 w-full overflow-hidden rounded-sm bg-[#1E1E1E]">
          <div
            className="h-full"
            style={{ width: data.utilization, background: "#E8001D" }}
          />
        </div>
      </div>
    </div>
  );
}
