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

/**
 * Per-market football odds, as posted by the admin.
 * Each top-level key matches the bytes32 market hash on-chain
 * (`keccak256("WINNER")` etc.). Keys are optional — a missing market
 * means the admin hasn't posted odds and the front must disable betting on it.
 *
 * `goalsTotal.line` is in goals (e.g. 2.5), not the int16 tenths the contract
 * expects — convert via `Math.round(line * 10)` when calling on-chain.
 */
export interface OddsDto {
  winner?: { homeWin: number; draw: number; awayWin: number };
  halftime?: { homeWin: number; draw: number; awayWin: number };
  goalsTotal?: { line: number; over: number; under: number };
  bothScore?: { yes: number; no: number };
  firstScorer?: { home: number; away: number; none: number };
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
  odds?: OddsDto;
  bettingContractAddress?: string;
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
