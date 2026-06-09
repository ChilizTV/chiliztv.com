import type {
  BrowseLeagueDto,
  BrowseMatchDto,
  StreamPreviewDto,
} from "@chiliztv/shared/dto/matches/BrowseMatchesDto";

/**
 * Match enriched with its parent league — what discover sections actually
 * need. Built once via {@link flattenMatches} so every downstream component
 * can stay pure on a flat list.
 */
export interface FlatMatch extends BrowseMatchDto {
  leagueId: number;
  leagueName: string;
  leagueLogo: string | null;
}

/**
 * Streamer card view-model — derived from each match's `streamsPreview`,
 * sorted by viewers and tagged with `featured: true` for the top entry.
 *
 * Carries `status` + `scoreBreakdown` so the badge can render a compact
 * `AET` / `PEN` suffix next to the score when the match went to extra time.
 */
export interface StreamerCard extends StreamPreviewDto {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  score: { home: number; away: number } | null;
  status: string;
  scoreBreakdown?: BrowseMatchDto['scoreBreakdown'];
  leagueName: string;
  featured?: boolean;
}

export type MatchTab = "all" | "live" | "upcoming";

export type SortMode =
  | "time_asc"
  | "time_desc"
  | "league_asc"
  | "league_desc";

export interface SortOption {
  value: SortMode;
  label: string;
}

export type LeagueDto = BrowseLeagueDto;
