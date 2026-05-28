import { ChapterShell } from "../components/ChapterShell";
import { ChapterHeading } from "../components/ChapterHeading";
import { ChapterLead } from "../components/ChapterLead";
import { StepsList, type Step } from "../components/StepsList";

const STEPS: Step[] = [
  {
    n: "01 →",
    title: "Pick a market",
    body: (
      <>
        <p className="m-0">Three core markets per match:</p>
        <ul className="mt-3.5 list-disc pl-4.5 text-[15px]">
          <li className="py-1">
            <strong className="font-medium text-white">1X2 Winner</strong> — Home / Draw / Away
          </li>
          <li className="py-1">
            <strong className="font-medium text-white">Over/Under goals</strong> — e.g. over 2.5
          </li>
          <li className="py-1">
            <strong className="font-medium text-white">Both teams to score</strong> — Yes / No
          </li>
        </ul>
      </>
    ),
  },
  {
    n: "02 →",
    title: "Choose side and amount",
    body: (
      <p className="m-0">
        Pick an outcome. Stake in USDC, or any supported token — the router converts automatically via Kayen DEX. Dialog shows the live pool, your implied probability and an estimated payout.
      </p>
    ),
  },
  {
    n: "03 →",
    title: "Confirm on-chain",
    body: (
      <p className="m-0">
        One signature. Your stake joins the outcome&apos;s pool the moment the tx mines — immutable until settlement. Final payout depends on the closing pool distribution.
      </p>
    ),
  },
  {
    n: "04 →",
    title: "Settle and claim",
    body: (
      <p className="m-0">
        Result posts on-chain at full-time. Winners sign a claim transaction. USDC lands in your wallet — no middleman, no manual approval.
      </p>
    ),
  },
];

export function ChapterPredict() {
  return (
    <ChapterShell num="02" metaTop="Prediction markets" metaBottom="How predictions work">
      <ChapterHeading>
        Predict what <span className="text-[#E8001D]">you know.</span>
      </ChapterHeading>
      <ChapterLead>
        On-chain markets per match. No bookmaker — the crowd&apos;s positions set the implied probability. 5% fee on the winning pool — 1% funds the leaderboard.
      </ChapterLead>
      <StepsList items={STEPS} />
    </ChapterShell>
  );
}
