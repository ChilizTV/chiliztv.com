/**
 * MatchStatus — union type des statuts possibles d'un match.
 * Aligné sur les valeurs API-Football retournées par le backend.
 * Non défini dans packages/domain (domain utilise string brut).
 */
export type MatchStatus =
  | 'NS'    // Not Started
  | 'LIVE'  // In Progress
  | 'FT'    // Full Time
  | 'AET'   // After Extra Time
  | 'PEN'   // Penalties
  | 'PST'   // Postponed
  | 'CANC'  // Cancelled
  | 'ABD'   // Abandoned
  | 'AWD'   // Technical Loss
  | 'WO';   // Walk Over

export interface TeamDto {
  id: number;
  name: string;
  logo?: string;
}

export interface LeagueDto {
  id: number;
  name: string;
  logo?: string;
  country?: string;
}

export interface ScoreDto {
  home: number | null;
  away: number | null;
}

export interface MatchResponseDto {
  id: number;
  apiFootballId: number;
  homeTeam: TeamDto;
  awayTeam: TeamDto;
  league: LeagueDto;
  season: number;
  status: MatchStatus;
  /** ISO 8601 — sérialisé depuis Date */
  matchDate: string;
  venue?: string;
  score?: ScoreDto;
  /** Latest W/D/L results for each team (oldest → newest, up to 5 chars). */
  homeForm: string | null;
  awayForm: string | null;
  /**
   * Last in-game minute the backend persisted (monotone — never reset to
   * null once a real value was seen). Null when the match hasn't started.
   */
  elapsed: number | null;
  /**
   * Halftime score (45'). Monotone — survives the HT pause when the
   * upstream briefly clears the field. Null pre-HT.
   */
  htHomeScore: number | null;
  htAwayScore: number | null;
  /**
   * Aggregate score after extra time (90' + ET). NULL for FT matches that
   * never reached AET. Optional in the wire shape — tolerates cached
   * payloads emitted before the AET/PEN rollout (the Redis TTL bridges
   * ~60-180s of `undefined`). Consumers MUST handle both null and undefined.
   */
  aetHomeScore?: number | null;
  aetAwayScore?: number | null;
  /**
   * Penalty shootout result (e.g. 5-4). NULL when the match didn't reach
   * a shootout. Reflects the shootout itself, NOT an aggregate.
   * Optional in the wire shape (same rationale as `aet*Score`).
   */
  penHomeScore?: number | null;
  penAwayScore?: number | null;
  /**
   * `true` when the fixture can potentially go to AET / penalties (cups +
   * league knockout phases). Drives the presence of the FULL_TIME_WINNER
   * market on-chain. Computed once at match create; never updated after.
   * Optional in the wire shape — pre-rollout cached payloads omit it and
   * consumers should treat absence as `false`.
   */
  isKnockout?: boolean;
  bettingContractAddress?: string;
  /**
   * `true` when the API-Football upstream is in degraded mode (circuit open or
   * daily quota exhausted) and scores may be stale. Optional for back-compat —
   * older clients ignore it; the new badge UI renders an amber pill when set.
   */
  dataStale?: boolean;
  /** ISO 8601 — sérialisé depuis Date */
  createdAt: string;
}

export interface MatchListResponseDto {
  matches: MatchResponseDto[];
  count: number;
}

export interface MatchStatsResponseDto {
  total: number;
  live: number;
  upcoming: number;
  finished: number;
}
