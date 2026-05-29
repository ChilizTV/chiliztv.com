import { Match } from '../entities/Match';

export interface MatchStats {
  totalMatches: number;
  liveMatches: number;
  upcomingMatches: number;
  finishedMatches: number;
}

export interface IMatchRepository {
  findAll(): Promise<Match[]>;
  findByDateRange(from: Date, to: Date): Promise<Match[]>;
  /**
   * Matches with `matchDate >= from`, no upper bound. Used by the front-facing
   * display path so every future match is surfaced regardless of how far out
   * its kickoff sits; the sync job alone caps how far ahead we ingest.
   */
  findFromDate(from: Date): Promise<Match[]>;
  findById(id: number): Promise<Match | null>;
  findByApiFootballId(apiId: number): Promise<Match | null>;
  findByLeagueId(leagueId: number): Promise<Match[]>;
  findLive(): Promise<Match[]>;
  findUpcoming(limit?: number): Promise<Match[]>;
  /**
   * Candidates for `CloseLiveMarketsJob` — matches with a deployed contract
   * whose status is live/blocked OR are within `kickoffBufferSeconds` of
   * kickoff. The implementation MUST filter `betting_contract_address IS NOT
   * NULL` to match the partial index `idx_matches_status_date`; any other
   * predicate (e.g. `LENGTH(...) > 0`) defeats the planner.
   *
   * @param now Current clock — passed in so MockClock can drive tests.
   * @param kickoffBufferSeconds Seconds before kickoff to include upcoming matches.
   */
  findOpenContractsCandidates(now: Date, kickoffBufferSeconds: number): Promise<Match[]>;
  save(match: Match): Promise<Match>;
  saveMany(matches: Match[]): Promise<Match[]>;
  update(match: Match): Promise<Match>;
  /**
   * Delete matches older than `before`, optionally skipping any match whose
   * `bettingContractAddress` (lowercased) is in
   * `exclusions.contractAddresses` or whose `apiFootballId` is in
   * `exclusions.apiFootballIds`. Used by the cleanup use case to preserve
   * matches still referenced by bets / predictions so the dashboard never
   * shows "Unknown match" for a position the user actually placed.
   *
   * Without `exclusions`, behaves like the original 24h cleanup.
   */
  deleteOldMatches(
    before: Date,
    exclusions?: {
      contractAddresses?: ReadonlySet<string>;
      apiFootballIds?: ReadonlySet<number>;
    },
  ): Promise<number>;
  getStats(): Promise<MatchStats>;
}
