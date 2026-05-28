import { ChapterShell } from "../components/ChapterShell";
import { ChapterHeading } from "../components/ChapterHeading";
import { ChapterLead } from "../components/ChapterLead";
import { StepsList, type Step } from "../components/StepsList";

const STEPS: Step[] = [
  {
    n: "01 →",
    title: "Pick an outcome",
    body: (
      <p className="m-0">
        Each market has 2-3 outcomes (Home / Draw / Away, Over / Under, etc.). Pick one — your stake joins that outcome&apos;s pool.
      </p>
    ),
  },
  {
    n: "02 →",
    title: "Stake USDC",
    body: (
      <p className="m-0">
        Your stake is locked in the match contract until full-time. Stake in USDC directly, or any supported token — the router converts via Kayen DEX in the same tx.
      </p>
    ),
  },
  {
    n: "03 →",
    title: "Match resolves",
    body: (
      <p className="m-0">
        When the score is final, the resolver reads it on-chain and identifies the winning outcome. The contract closes the market — no manual settlement.
      </p>
    ),
  },
  {
    n: "04 →",
    title: "Claim your share",
    body: (
      <p className="m-0">
        Winners split <strong className="font-medium text-white">95%</strong> of the total pool, pro-rata to their stake on the winning outcome. <strong className="font-medium text-white">5%</strong> protocol fee — <strong className="font-medium text-white">1%</strong> funds the leaderboard rewards, <strong className="font-medium text-white">4%</strong> goes to treasury.
      </p>
    ),
  },
];

export function ChapterParimutuel() {
  return (
    <ChapterShell num="03" metaTop="The economics" metaBottom="How the pool pays out">
      <ChapterHeading>
        Winners split the pool. <span className="text-[#E8001D]">Pari-mutuel.</span>
      </ChapterHeading>
      <ChapterLead>
        No bookmaker. No odds set in advance. The crowd&apos;s positions set the implied probability — winners share what losers staked, minus a small fee.
      </ChapterLead>
      <StepsList items={STEPS} />
      <p className="mt-10 max-w-200 text-[14px] font-light leading-[1.65] text-white/55">
        <strong className="font-medium text-white">Void protection.</strong> If no one staked on the winning outcome, the market is auto-cancelled and every stake is refunded — no orphan winners, no lost USDC.
      </p>
    </ChapterShell>
  );
}
