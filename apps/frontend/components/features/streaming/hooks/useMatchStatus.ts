import { useMemo } from "react";
import type { Match } from "@/types/api.types";
import { getMatchStatus, getMatchTime, generateMockViewers, type MatchStatus } from "../utils";

export interface MatchDisplay extends Match {
  displayStatus: MatchStatus;
  time: string;
  viewers?: number;
}

/**
 * @notice Transform matches with status and time display
 * @dev Filters matches to yesterday-tomorrow range, adds display properties
 * @param apiMatches Matches from API
 * @return Transformed matches with display status and time
 */
export function useMatchStatus(apiMatches: Match[]): MatchDisplay[] {
  return useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const filteredMatches = apiMatches.filter((match: Match) => {
      const matchDate = new Date(match.startTime);
      return matchDate >= yesterday && matchDate <= tomorrow;
    });

    return filteredMatches.map((match: Match): MatchDisplay => {
      const status = getMatchStatus(match);
      const time = getMatchTime(match);
      return {
        ...match,
        displayStatus: status,
        time,
        viewers: status === "LIVE" ? generateMockViewers() : undefined,
      };
    });
  }, [apiMatches]);
}
