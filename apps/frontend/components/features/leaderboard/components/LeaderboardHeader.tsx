import Image from "next/image";

export function LeaderboardHeader() {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: "#E8001D" }} />
        <h1
          className="text-[34px] sm:text-[44px] font-black uppercase tracking-[0.05em] leading-none text-white"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          Leaderboard
        </h1>
      </div>
      <p className="text-[13px] ml-4" style={{ color: "#888", fontFamily: "'Barlow', sans-serif" }}>
        Compete with the best predictors and fan token holders on{" "}
        <span style={{ display: "inline-flex", verticalAlign: "middle", margin: "0 3px" }}>
          <Image src="/Logo_FINAL.svg" alt="ChilizTV" width={14} height={14} />
        </span>{" "}
        ChilizTV. Climb the ranks, earn rewards.
      </p>
    </div>
  );
}
