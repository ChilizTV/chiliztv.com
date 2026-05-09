"use client";

import { useState } from "react";
import type { Address } from "viem";
import { useMyBetsOnMatch } from "@/components/features/dashboard/hooks/useMyBetsOnMatch";
import type { MatchOdds } from "@/types/api.types";
import { MatchMarketsList } from "../MatchMarketsList";
import { MyBetsOnMatch } from "../MyBetsOnMatch";

type Tab = "markets" | "mybets";

interface AboutLiveTabsProps {
  bettingContractAddress?: Address;
  walletAddress?: string;
  homeTeam?: string;
  awayTeam?: string;
  matchOdds?: MatchOdds;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}

function TabButton({ active, onClick, children, badge }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono-ctv inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors"
      style={{
        borderColor: active ? "#E8001D" : "#1E1E1E",
        background: active ? "rgba(232,0,29,0.08)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.55)",
      }}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E8001D] px-1 text-[9px] font-bold tabular-nums text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

export function AboutLiveTabs({
  bettingContractAddress,
  walletAddress,
  homeTeam,
  awayTeam,
  matchOdds,
}: AboutLiveTabsProps) {
  const [tab, setTab] = useState<Tab>("markets");

  const { bets } = useMyBetsOnMatch({
    user: walletAddress,
    contractAddress: bettingContractAddress,
  });
  const myBetsCount = bets.length;

  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#111]">
      <div className="flex items-center gap-2 border-b border-[#1E1E1E] p-3">
        <TabButton active={tab === "markets"} onClick={() => setTab("markets")}>
          Markets
        </TabButton>
        <TabButton
          active={tab === "mybets"}
          onClick={() => setTab("mybets")}
          badge={myBetsCount}
        >
          My bet
        </TabButton>
        <span className="font-mono-ctv ml-auto text-[10px] uppercase tracking-[0.16em] text-white/35">
          {tab === "markets" ? "Settled on Chiliz" : `${myBetsCount} positions`}
        </span>
      </div>

      {tab === "markets" ? (
        <MatchMarketsList
          contractAddress={bettingContractAddress}
          walletAddress={walletAddress}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          matchOdds={matchOdds}
        />
      ) : (
        <MyBetsOnMatch
          contractAddress={bettingContractAddress}
          walletAddress={walletAddress}
          onPickMarket={() => setTab("markets")}
        />
      )}
    </div>
  );
}
