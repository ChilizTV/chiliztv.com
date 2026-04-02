/**
 * @notice Header section for leaderboard page
 * @dev Displays title, description with ChilizTV branding
 */

import Image from "next/image";

/**
 * @notice Render leaderboard header with title and description
 */
export function LeaderboardHeader() {
  return (
    <div className="text-center mb-8 px-2 sm:px-0">
      <h1
        className="text-[32px] sm:text-[40px] font-bold text-white mb-3 sm:mb-4"
        style={{ fontFamily: "Lexend, sans-serif" }}
      >
        🏆 Leaderboard
      </h1>
      <p
        className="text-white/70 text-[16px] sm:text-[18px] max-w-2xl mx-auto"
        style={{ fontFamily: "Lexend, sans-serif" }}
      >
        Compete with the best predicts and fan token collectors on{" "}
        <span style={{ display: "inline-flex", verticalAlign: "middle", margin: "0 4px" }}>
          <Image src="/Logo_FINAL.svg" alt="Chiliz Icon" width={20} height={20} style={{ display: "block" }} />
        </span>{" "}
        ChilizTV. Climb the ranks and earn exclusive rewards!
      </p>
    </div>
  );
}
