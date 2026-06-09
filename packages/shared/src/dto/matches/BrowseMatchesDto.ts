export interface StreamPreviewDto {
  streamId: string;
  streamerName: string;
  thumbnailUrl: string | null;
  viewers: number;
}

/**
 * Score breakdown for matches that went to extra time / penalties.
 * Always optional — only emitted when at least one of AET / PEN happened.
 * The top-level `score` field remains the **physical** final score (90' for
 * FT, AET aggregate for AET/PEN — convention bookmaker). This breakdown
 * carries the detail needed to render "5 — 4 pen (1 — 1)".
 */
export interface MatchScoreBreakdownDto {
  ninety: { home: number; away: number };
  aet?: { home: number; away: number };
  pen?: { home: number; away: number };
}

export interface BrowseMatchDto {
  id: number;
  homeTeam: { name: string; logoUrl: string | null };
  awayTeam: { name: string; logoUrl: string | null };
  kickoffAt: string;
  status: string;
  score: { home: number; away: number } | null;
  /**
   * Optional detail for AET/PEN matches. Null when the match never went to
   * extra time. Optional in the wire shape (back-compat with cached
   * payloads emitted before the rollout).
   */
  scoreBreakdown?: MatchScoreBreakdownDto | null;
  /** `true` for knockout matches (cups + league knockout phases). Default false when absent. */
  isKnockout?: boolean;
  /** Latest W/D/L results (oldest → newest, up to 5 chars). Null when API has no form data. */
  homeForm: string | null;
  awayForm: string | null;
  /** Last in-game minute persisted by the backend. Null pre-kickoff. */
  elapsed: number | null;
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
