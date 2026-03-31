import { Zap, TrendingUp, Trophy, Calendar, LucideIcon } from "lucide-react";
import type { Match } from "@/types/api.types";
import { MatchStatus } from "@/lib/utils/constants/match";
import { isMatchLive } from "@/lib/utils/formatting/date";

// Re-export MatchStatus for convenience
export { MatchStatus };
export type { MatchStatus as MatchStatusType };

export interface StatusConfig {
  icon: LucideIcon;
  text: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  animate: string;
}

/**
 * @notice Get match status based on match data
 * @dev Determines if match is live, open for predictions, or ended
 * @param match Match data from API
 * @return Status enum value
 */
export function getMatchStatus(match: Match): MatchStatus {
  const now = new Date();
  const matchDate = new Date(match.startTime);

  if (
    match.status === "Match Finished" ||
    match.status === "FT" ||
    match.status === "AET" ||
    match.status === "PEN"
  ) {
    return MatchStatus.ENDED;
  }

  if (
    match.status === "1H" ||
    match.status === "2H" ||
    match.status === "HT" ||
    match.status === "LIVE"
  ) {
    return MatchStatus.LIVE;
  }

  if (now < matchDate) {
    return MatchStatus.PREDICTION_OPEN;
  }

  // Fallback: Use time-based check if status is unknown/missing
  if (isMatchLive(matchDate)) {
    return MatchStatus.LIVE;
  }

  return MatchStatus.ENDED;
}

/**
 * @notice Get status configuration for styling
 * @dev Returns icon, colors, and animation settings for each status
 * @param status Match status
 * @return Configuration object with styling properties
 */
export function getStatusConfig(status: MatchStatus): StatusConfig {
  switch (status) {
    case MatchStatus.LIVE:
      return {
        icon: Zap,
        text: "LIVE",
        bgColor: "bg-red-500/10",
        textColor: "text-red-400",
        borderColor: "border-red-500/30",
        glowColor: "shadow-red-500/20",
        animate: "animate-pulse",
      };
    case MatchStatus.PREDICTION_OPEN:
      return {
        icon: TrendingUp,
        text: "PREDICTION OPEN",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/30",
        glowColor: "shadow-blue-500/20",
        animate: "",
      };
    case MatchStatus.SCHEDULED:
      return {
        icon: Calendar,
        text: "SCHEDULED",
        bgColor: "bg-blue-500/10",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/30",
        glowColor: "shadow-blue-500/10",
        animate: "",
      };
    case MatchStatus.ENDED:
      return {
        icon: Trophy,
        text: "ENDED",
        bgColor: "bg-gray-500/10",
        textColor: "text-gray-400",
        borderColor: "border-gray-500/30",
        glowColor: "shadow-gray-500/10",
        animate: "",
      };
  }
}

/**
 * @notice Get card styling classes based on status
 * @dev Returns gradient and shadow classes for match card
 * @param status Match status
 * @return Tailwind class string
 */
export function getCardStyle(status: MatchStatus): string {
  switch (status) {
    case MatchStatus.LIVE:
      return "bg-gradient-to-br from-red-950/40 via-gray-900/95 to-black/90 border-red-500/20 shadow-lg shadow-red-500/10";
    case MatchStatus.PREDICTION_OPEN:
    case MatchStatus.SCHEDULED:
      return "bg-gradient-to-br from-blue-950/40 via-gray-900/95 to-black/90 border-blue-500/20 shadow-lg shadow-blue-500/10";
    case MatchStatus.ENDED:
      return "bg-gradient-to-br from-gray-950/40 via-gray-900/95 to-black/90 border-gray-500/20 shadow-lg shadow-gray-500/10";
  }
}

/**
 * @notice Status priority for sorting matches
 * @dev LIVE matches appear first, then PREDICTION_OPEN, then SCHEDULED, then ENDED
 */
export const STATUS_PRIORITY: Record<MatchStatus, number> = {
  [MatchStatus.LIVE]: 0,
  [MatchStatus.PREDICTION_OPEN]: 1,
  [MatchStatus.SCHEDULED]: 2,
  [MatchStatus.ENDED]: 3,
};
