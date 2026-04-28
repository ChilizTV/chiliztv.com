"use client";

import Image from "next/image";
import { TokenHolderEntry } from "../utils";
import { formatLargeNumber } from "@/lib/utils/formatting/number";
import { formatUSDValue } from "@/lib/utils/formatting/price";

interface TokenHolderCardProps {
  holder: TokenHolderEntry;
  tokenLogo: string;
}

const TOP_BG: Record<number, string> = {
  1: "linear-gradient(90deg, rgba(245,197,24,0.07) 0%, transparent 60%)",
  2: "linear-gradient(90deg, rgba(180,180,180,0.04) 0%, transparent 60%)",
  3: "linear-gradient(90deg, rgba(200,110,40,0.06) 0%, transparent 60%)",
};
const RANK_COLOR: Record<number, string> = { 1: "#F5C518", 2: "#aaaaaa", 3: "#c87941" };
const MEDALS = ["🥇", "🥈", "🥉"];

export function TokenHolderCard({ holder, tokenLogo }: TokenHolderCardProps) {
  const isTop3 = holder.rank <= 3;
  const rowBg = TOP_BG[holder.rank] ?? "transparent";
  const rankColor = RANK_COLOR[holder.rank] ?? "#555";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 transition-colors duration-150"
      style={{ background: rowBg, borderBottom: "1px solid #2A2A2A" }}
      onMouseEnter={(e) => {
        if (!isTop3) (e.currentTarget as HTMLDivElement).style.background = "#181818";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = rowBg;
      }}
    >
      {/* Rank */}
      <div
        className="w-10 flex-shrink-0 text-center font-mono text-[15px] font-bold"
        style={{ color: rankColor, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {isTop3 ? MEDALS[holder.rank - 1] : holder.rank}
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{ border: "1px solid #2A2A2A" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={holder.avatar} alt={holder.username} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div
            className="text-[13px] font-bold text-white truncate"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {holder.username}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Image src={tokenLogo} alt={holder.topToken} width={11} height={11} className="rounded-full flex-shrink-0" />
            <span className="text-[11px] truncate" style={{ color: "#555" }}>
              {holder.topToken} · {holder.tokensHeld} tokens
            </span>
          </div>
        </div>
      </div>

      {/* Stats — desktop */}
      <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
        {/* Total tokens */}
        <div className="text-center w-24">
          <div className="font-mono text-[13px] font-semibold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatLargeNumber(holder.totalTokens)}
          </div>
          <div className="text-[9px] uppercase tracking-[0.08em]" style={{ color: "#555" }}>Tokens</div>
        </div>

        {/* Portfolio */}
        <div className="text-center w-24">
          <div className="font-mono text-[13px] font-bold" style={{ color: "#F5C518", fontFamily: "'JetBrains Mono', monospace" }}>
            {formatUSDValue(holder.portfolioValue)}
          </div>
          <div className="text-[9px] uppercase tracking-[0.08em]" style={{ color: "#555" }}>Portfolio</div>
        </div>
      </div>

      {/* Mobile: portfolio only */}
      <div className="sm:hidden flex-shrink-0 text-right">
        <div className="font-mono text-[13px] font-bold" style={{ color: "#F5C518", fontFamily: "'JetBrains Mono', monospace" }}>
          {formatUSDValue(holder.portfolioValue)}
        </div>
        <div className="text-[10px]" style={{ color: "#555" }}>portfolio</div>
      </div>
    </div>
  );
}
