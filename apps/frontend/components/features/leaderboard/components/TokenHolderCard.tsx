/**
 * @notice Individual token holder card component for leaderboard
 * @dev Displays rank, avatar, username, token holdings, and portfolio value
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { TokenHolderEntry } from "../utils";
import { RankIcon } from "./RankIcon";
import { formatLargeNumber } from "@/lib/utils/formatting/number";
import { formatUSDValue } from "@/lib/utils/formatting/price";

interface TokenHolderCardProps {
  holder: TokenHolderEntry;
  tokenLogo: string;
}

/**
 * @notice Render token holder leaderboard card
 * @param holder Token holder data entry
 * @param tokenLogo URL to top token logo
 */
export function TokenHolderCard({ holder, tokenLogo }: TokenHolderCardProps) {
  return (
    <div
      className={`p-4 sm:p-6 rounded-lg border transition-all duration-300 hover:border-primary/30 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 ${
        holder.rank <= 3
          ? "bg-gradient-to-r from-primary/10 to-[#FF3465]/10 border-primary/20"
          : "bg-[#0f0f0f] border-white/10"
      }`}
    >
      {/* Rank & Avatar */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
          <RankIcon rank={holder.rank} />
        </div>
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border border-white/10">
          <AvatarImage src={holder.avatar} alt={holder.username} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {holder.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* User Info */}
      <div className="flex-grow text-center sm:text-left">
        <h3 className="font-bold text-white text-sm sm:text-[16px]" style={{ fontFamily: "Lexend, sans-serif" }}>
          {holder.username}
        </h3>
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs sm:text-sm text-white/60 mt-1">
          <div className="flex items-center gap-1">
            <Image src={tokenLogo} alt={holder.topToken} width={16} height={16} className="w-4 h-4 rounded-full" />
            <span>Top: {holder.topToken}</span>
          </div>
          <span>{holder.tokensHeld} different tokens</span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center sm:text-right flex-shrink-0 min-w-[110px]">
        <div className="text-lg sm:text-[20px] font-bold text-blue-400 whitespace-nowrap">
          {formatLargeNumber(holder.totalTokens)} tokens
        </div>
        <div className="text-xs sm:text-sm text-white/60">{formatUSDValue(holder.portfolioValue)} value</div>
      </div>
    </div>
  );
}
