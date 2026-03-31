/**
 * @notice Date formatting utilities for matches and timestamps
 * @dev Provides consistent date/time formatting across the app
 */

/**
 * @notice Format match start time as countdown or live indicator
 * @param matchDate Match start date
 * @param now Current date for comparison
 * @return Formatted time string
 */
export function formatMatchTime(matchDate: Date, now: Date): string {
  const diff = matchDate.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diff < 0) {
    return "LIVE";
  } else if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "Starting soon";
  }
}

/**
 * @notice Format countdown timer for upcoming matches
 * @param matchDate Match start date
 * @return Countdown string or "LIVE"
 */
export function formatCountdown(matchDate: Date): string {
  const now = new Date();
  return formatMatchTime(matchDate, now);
}

/**
 * @notice Check if match is currently live
 * @param matchDate Match start date
 * @param durationMinutes Match duration in minutes (default 90)
 * @return True if match is live
 */
export function isMatchLive(matchDate: Date, durationMinutes: number = 90): boolean {
  const now = new Date();
  const matchEnd = new Date(matchDate.getTime() + durationMinutes * 60000);
  return now >= matchDate && now <= matchEnd;
}

/**
 * @notice Format date to locale string
 * @param date Date to format
 * @return Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * @notice Format date and time to locale string
 * @param date Date to format
 * @return Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
