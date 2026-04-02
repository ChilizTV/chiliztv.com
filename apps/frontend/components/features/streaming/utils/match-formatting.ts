import type { Match } from "@/types/api.types";
import { abbreviateNumber, clamp } from "@/lib/utils/formatting/number";

/**
 * @notice Format viewer count for display
 * @dev Converts large numbers to M/K notation using shared utility
 * @param num Viewer count
 * @return Formatted string (e.g., "1.5M", "450K")
 */
export function formatViewers(num: number): string {
  return abbreviateNumber(num);
}

/**
 * @notice Format match score for display
 * @dev Shows "- - -" if scores not available
 * @param homeScore Home team score
 * @param awayScore Away team score
 * @return Formatted score string
 */
export function formatScore(
  homeScore: number | null | undefined,
  awayScore: number | null | undefined
): string {
  if (homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined) {
    return `${homeScore} - ${awayScore}`;
  }
  return "- - -";
}

/**
 * @notice Get match time display string
 * @dev Handles live minutes, countdown, and match status
 * @param match Match data from API
 * @param now Current time for calculation
 * @return Time string (e.g., "45'", "HT", "in 2h 30m")
 */
export function getMatchTime(match: Match, now: Date = new Date()): string {
  const matchDate = new Date(match.startTime);

  if (match.status === "Match Finished" || match.status === "FT") {
    return "FT";
  }

  if (match.status === "1H") {
    const elapsed = Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60));
    const minute = clamp(elapsed, 0, 45);
    return `${minute}'`;
  }

  if (match.status === "2H") {
    const elapsed = Math.floor((now.getTime() - matchDate.getTime()) / (1000 * 60));
    const minute = clamp(elapsed, 46, 90);
    return `${minute}'`;
  }

  if (match.status === "HT") {
    return "HT";
  }

  if (now < matchDate) {
    const diff = matchDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days}d`;
    }
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    return `in ${minutes}m`;
  }

  return "TBD";
}

/**
 * @notice Generate mock viewer count for live matches
 * @dev Returns random number between 500K and 3.5M
 * @return Random viewer count
 */
export function generateMockViewers(): number {
  return Math.floor(Math.random() * 3000000) + 500000;
}
