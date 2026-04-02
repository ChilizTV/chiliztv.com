/**
 * @notice Rank icon component for leaderboard positions
 * @dev Shows crown/medal icons for top 3, rank number for others
 */

import { Crown, Medal, Award } from "lucide-react";

interface RankIconProps {
  rank: number;
}

/**
 * @notice Display rank icon or number
 * @param rank Position in leaderboard (1-based)
 * @return JSX element with appropriate icon/number
 */
export function RankIcon({ rank }: RankIconProps) {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="text-[18px] font-bold text-white/60">#{rank}</span>;
  }
}
