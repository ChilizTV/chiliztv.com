export interface StreamPreviewDto {
  streamId: string;
  streamerName: string;
  thumbnailUrl: string | null;
  viewers: number;
}

export interface BrowseMatchDto {
  id: number;
  homeTeam: { name: string; logoUrl: string | null };
  awayTeam: { name: string; logoUrl: string | null };
  kickoffAt: string;
  status: string;
  score: { home: number; away: number } | null;
  /** Latest W/D/L results (oldest → newest, up to 5 chars). Null when API has no form data. */
  homeForm: string | null;
  awayForm: string | null;
  /** PariMatch proxy address (lowercased). Null when the match has no contract deployed yet. */
  contractAddress: string | null;
  streamsPreview: StreamPreviewDto[];
}

export interface BrowseLeagueDto {
  league: {
    id: number;
    name: string;
    logoUrl: string | null;
    country: string | null;
  };
  matches: BrowseMatchDto[];
}

export interface BrowseMatchesResponseDto {
  success: boolean;
  leagues: BrowseLeagueDto[];
  /**
   * `true` when API-Football is in degraded mode (circuit open or quota
   * exhausted). Set once on the envelope — applies to every match in the
   * response. Optional for back-compat with older clients.
   */
  dataStale?: boolean;
}
