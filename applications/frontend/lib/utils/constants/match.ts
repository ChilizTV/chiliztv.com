/**
 * @notice Match status constants and configurations
 * @dev Centralized match status definitions for consistency
 */

/**
 * @notice Match status types
 */
export enum MatchStatus {
  LIVE = "LIVE",
  PREDICTION_OPEN = "PREDICTION_OPEN",
  ENDED = "ENDED",
  SCHEDULED = "SCHEDULED",
}

/**
 * @notice Status badge configuration
 */
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon?: string;
}

/**
 * @notice Status configurations for UI display
 */
export const STATUS_CONFIGS: Record<MatchStatus, StatusConfig> = {
  [MatchStatus.LIVE]: {
    label: "LIVE",
    color: "text-red-500",
    bgColor: "bg-red-500/20",
    icon: "🔴",
  },
  [MatchStatus.PREDICTION_OPEN]: {
    label: "Prediction Open",
    color: "text-green-500",
    bgColor: "bg-green-500/20",
    icon: "🎯",
  },
  [MatchStatus.ENDED]: {
    label: "Ended",
    color: "text-gray-500",
    bgColor: "bg-gray-500/20",
    icon: "✓",
  },
  [MatchStatus.SCHEDULED]: {
    label: "Scheduled",
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    icon: "📅",
  },
};

/**
 * @notice Priority order for sorting matches by status
 */
export const STATUS_PRIORITY: Record<MatchStatus, number> = {
  [MatchStatus.LIVE]: 0,
  [MatchStatus.PREDICTION_OPEN]: 1,
  [MatchStatus.SCHEDULED]: 2,
  [MatchStatus.ENDED]: 3,
};

/**
 * @notice Get status badge classes for a given match status
 * @dev Returns Tailwind classes for simple badge styling
 * @param status Match status enum value
 * @return StatusConfig with label, color classes, and emoji icon
 */
export function getSimpleStatusBadge(status: MatchStatus): StatusConfig {
  return STATUS_CONFIGS[status];
}
