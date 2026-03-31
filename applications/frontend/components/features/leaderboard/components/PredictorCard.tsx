/**
 * @notice Individual predictor card component for leaderboard
 * @dev Displays rank, avatar, username, stats, and favorite team
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import Image from "next/image";
import { PredictorEntry } from "../utils";
import { RankIcon } from "./RankIcon";
import { formatUSDValue } from "@/lib/utils/formatting/price";

interface PredictorCardProps {
  predictor: PredictorEntry;
  tokenLogo: string;
}

/**
 * @notice Render predictor leaderboard card
 * @param predictor Predictor data entry
 * @param tokenLogo URL to favorite team token logo
 */
export function PredictorCard({ predictor, tokenLogo }: PredictorCardProps) {
  return (
    <div
      className={`p-4 sm:p-6 rounded-lg border transition-all duration-300 hover:border-primary/30 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 ${
        predictor.rank <= 3
          ? "bg-gradient-to-r from-primary/10 to-[#FF3465]/10 border-primary/20"
          : "bg-[#0f0f0f] border-white/10"
      }`}
    >
      {/* Rank & Avatar */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
          <RankIcon rank={predictor.rank} />
        </div>
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border border-white/10">
          <AvatarImage src={predictor.avatar} alt={predictor.username} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {predictor.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* User Info */}
      <div className="flex-grow text-center sm:text-left">
        <h3 className="font-bold text-white text-sm sm:text-[16px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          {predictor.username}
        </h3>
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs sm:text-sm text-white/60 mt-1">
          <div className="flex items-center gap-1">
            <Image
              src={tokenLogo}
              alt={predictor.favoriteTeam}
              width={16}
              height={16}
              className="w-4 h-4 rounded-full"
            />
            <span>Fan of {predictor.favoriteTeam}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>{predictor.streak} win streak</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center sm:text-right flex-shrink-0 min-w-[110px]">
        <div className="text-lg sm:text-[20px] font-bold text-green-400 whitespace-nowrap">
          {formatUSDValue(predictor.totalWinnings)}
        </div>
        <div className="text-xs sm:text-sm text-white/60">
          {predictor.winRate}% win rate • {predictor.totalPredictions} predictions
        </div>
      </div>
    </div>
  );
}
