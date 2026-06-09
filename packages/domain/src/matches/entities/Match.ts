export interface MatchProps {
  id: number;
  apiFootballId: number;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo?: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo?: string;
  leagueId: number;
  leagueName: string;
  leagueLogo?: string;
  leagueCountry?: string;
  season: number;
  status: string;
  matchDate: Date;
  venue?: string;
  homeScore?: number;
  awayScore?: number;
  /** Last 5 results from the home team's perspective (oldest → newest). NULL when no API data. */
  homeForm?: string | null;
  /** Last 5 results from the away team's perspective. */
  awayForm?: string | null;
  /**
   * In-game minute persisted from the latest API-Football snapshot. NEVER
   * overwritten with null — once a non-null value is captured we keep it
   * across HT / post-FT so the UI minute counter doesn't reset visually.
   */
  elapsed?: number | null;
  /**
   * Score at halftime (45'). Monotone — once captured, never reset to null
   * (HT pause briefly clears the upstream field). Required to resolve the
   * HALFTIME market early via {@link ResolveHalftimeMarketUseCase}.
   */
  htHomeScore?: number | null;
  htAwayScore?: number | null;
  /**
   * Aggregate score after extra time (90' + ET). NULL for FT matches that
   * never reached AET. Used by display layer ("3 — 2 a.e.t.") and by
   * FULL_TIME_WINNER market resolution (knockout-only).
   */
  aetHomeScore?: number | null;
  aetAwayScore?: number | null;
  /**
   * Penalty shootout result (e.g. 5-4). NULL when the fixture didn't reach
   * a shootout. The score reflects the shootout itself, NOT an aggregate.
   * Used by display ("5 — 4 pen (1 — 1)") and to derive FULL_TIME_WINNER
   * when the match went all the way to penalties.
   */
  penHomeScore?: number | null;
  penAwayScore?: number | null;
  /**
   * `true` when the fixture can potentially go to extra time / penalties
   * (cup competitions, knockout phases of league formats). Computed ONCE at
   * match create via the `KnockoutMatchPolicy` and never updated on
   * subsequent re-syncs — see migration 035 and SyncMatchesUseCase for the
   * rationale (proxy is deployed at create time with or without the
   * FULL_TIME_WINNER market; flipping the flag post-deploy would create
   * entity↔contract drift).
   */
  isKnockout?: boolean;
  bettingContractAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Match {
  private constructor(private readonly props: MatchProps) {}

  static create(props: Omit<MatchProps, 'createdAt' | 'updatedAt'>): Match {
    const now = new Date();
    return new Match({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: MatchProps): Match {
    return new Match(props);
  }

  isLive(): boolean {
    return ['1H', '2H', 'HT'].includes(this.props.status);
  }

  isUpcoming(): boolean {
    return this.props.status === 'NS' && this.props.matchDate > new Date();
  }

  isFinished(): boolean {
    // FT (90'), AET (after extra time), PEN (after penalty shootout) — all
    // terminal states where the score is final and markets can be settled.
    return this.props.status === 'FT' || this.props.status === 'AET' || this.props.status === 'PEN';
  }

  /** `true` when the match reached extra time (AET) or penalty shootout (PEN). */
  wentToExtraTime(): boolean {
    return this.props.status === 'AET' || this.props.status === 'PEN';
  }

  /** `true` when the match was decided by a penalty shootout. */
  wentToPenalties(): boolean {
    return this.props.status === 'PEN';
  }

  /**
   * Returns the **physical** final score after extra time.
   *
   * Convention: for AET/PEN matches, returns the AET aggregate (1-1 at 90' +
   * 2-1 scored in extra time → `{home:3, away:2}`). Does NOT include the
   * penalty shootout result in the goal count — that's exposed separately via
   * {@link getPenaltyWinner}.
   *
   * Display rule: this score is what gets shown as `3 — 2 a.e.t.` in the UI.
   *
   * Settlement rule: the existing WINNER market still uses the 90' score
   * ({@link getHomeScore} / {@link getAwayScore}), NOT this method, to match
   * bookmaker convention. Use this only for display and for FULL_TIME_WINNER
   * market resolution.
   *
   * Falls back to the 90' score when AET fields are absent (FT match or pre-
   * migration row).
   */
  getFinalScore(): { home: number; away: number } | null {
    const home90 = this.props.homeScore;
    const away90 = this.props.awayScore;
    if (this.wentToExtraTime()) {
      const aetHome = this.props.aetHomeScore;
      const aetAway = this.props.aetAwayScore;
      if (aetHome != null && aetAway != null) {
        return { home: aetHome, away: aetAway };
      }
    }
    if (home90 == null || away90 == null) return null;
    return { home: home90, away: away90 };
  }

  /**
   * Returns `'home'` / `'away'` when the match was decided on penalties and
   * the shootout score is known; `null` otherwise (FT, AET-resolved, or PEN
   * with missing shootout score). Used by FULL_TIME_WINNER market resolution.
   */
  getPenaltyWinner(): 'home' | 'away' | null {
    if (!this.wentToPenalties()) return null;
    const home = this.props.penHomeScore;
    const away = this.props.penAwayScore;
    if (home == null || away == null) return null;
    if (home > away) return 'home';
    if (away > home) return 'away';
    return null; // degenerate — shootouts can't tie
  }

  /** `true` for matches that can potentially go to AET/PEN (cups + league knockout phases). */
  isKnockout(): boolean {
    return this.props.isKnockout === true;
  }

  updateScore(homeScore: number, awayScore: number): void {
    this.props.homeScore = homeScore;
    this.props.awayScore = awayScore;
    this.props.updatedAt = new Date();
  }

  updateStatus(status: string): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  getId(): number {
    return this.props.id;
  }

  getLeagueId(): number {
    return this.props.leagueId;
  }

  getStatus(): string {
    return this.props.status;
  }

  getMatchDate(): Date {
    return this.props.matchDate;
  }

  getHomeScore(): number | undefined {
    return this.props.homeScore;
  }

  getAwayScore(): number | undefined {
    return this.props.awayScore;
  }

  getBettingContractAddress(): string | undefined {
    return this.props.bettingContractAddress;
  }

  getHomeForm(): string | null {
    return this.props.homeForm ?? null;
  }

  getAwayForm(): string | null {
    return this.props.awayForm ?? null;
  }

  getElapsed(): number | null {
    return this.props.elapsed ?? null;
  }

  /**
   * Monotone setter: silently ignores null/undefined to preserve the last
   * known value across HT and post-FT gaps where API-Football clears the
   * field. Use {@link updateScore} for plain score writes.
   */
  setElapsed(elapsed: number | null | undefined): void {
    if (elapsed === null || elapsed === undefined) return;
    this.props.elapsed = elapsed;
    this.props.updatedAt = new Date();
  }

  getHtHomeScore(): number | null {
    return this.props.htHomeScore ?? null;
  }

  getHtAwayScore(): number | null {
    return this.props.htAwayScore ?? null;
  }

  getAetHomeScore(): number | null {
    return this.props.aetHomeScore ?? null;
  }

  getAetAwayScore(): number | null {
    return this.props.aetAwayScore ?? null;
  }

  getPenHomeScore(): number | null {
    return this.props.penHomeScore ?? null;
  }

  getPenAwayScore(): number | null {
    return this.props.penAwayScore ?? null;
  }

  /**
   * Monotone setter for the extra-time aggregate score — same null-guard
   * semantics as {@link setHalftimeScore}. Returns `true` if anything changed.
   */
  setExtratimeScore(homeScore: number | null | undefined, awayScore: number | null | undefined): boolean {
    if (homeScore === null || homeScore === undefined) return false;
    if (awayScore === null || awayScore === undefined) return false;
    if (this.props.aetHomeScore === homeScore && this.props.aetAwayScore === awayScore) return false;
    this.props.aetHomeScore = homeScore;
    this.props.aetAwayScore = awayScore;
    this.props.updatedAt = new Date();
    return true;
  }

  /**
   * Monotone setter for the penalty shootout result — same null-guard
   * semantics as {@link setHalftimeScore}. Returns `true` if anything changed.
   */
  setPenaltyScore(homeScore: number | null | undefined, awayScore: number | null | undefined): boolean {
    if (homeScore === null || homeScore === undefined) return false;
    if (awayScore === null || awayScore === undefined) return false;
    if (this.props.penHomeScore === homeScore && this.props.penAwayScore === awayScore) return false;
    this.props.penHomeScore = homeScore;
    this.props.penAwayScore = awayScore;
    this.props.updatedAt = new Date();
    return true;
  }

  /**
   * Monotone setter for the halftime score — same null-guard semantics as
   * {@link setElapsed}. Only persists when BOTH home AND away are real
   * numbers (a partial HT score is meaningless for the resolveByScore
   * input shape). Returns true if anything actually changed.
   */
  setHalftimeScore(homeScore: number | null | undefined, awayScore: number | null | undefined): boolean {
    if (homeScore === null || homeScore === undefined) return false;
    if (awayScore === null || awayScore === undefined) return false;
    if (this.props.htHomeScore === homeScore && this.props.htAwayScore === awayScore) return false;
    this.props.htHomeScore = homeScore;
    this.props.htAwayScore = awayScore;
    this.props.updatedAt = new Date();
    return true;
  }

  /** Flat snapshot of the internal props. Symmetric with `reconstitute` — meant for cache round-trip, not API responses (use `toJSON` for that). */
  toRaw(): MatchProps {
    return { ...this.props };
  }

  toJSON(): any {
    return {
      id: this.props.id,
      apiFootballId: this.props.apiFootballId,
      homeTeam: {
        id: this.props.homeTeamId,
        name: this.props.homeTeamName,
        logo: this.props.homeTeamLogo,
      },
      awayTeam: {
        id: this.props.awayTeamId,
        name: this.props.awayTeamName,
        logo: this.props.awayTeamLogo,
      },
      league: {
        id: this.props.leagueId,
        name: this.props.leagueName,
        logo: this.props.leagueLogo,
      },
      season: this.props.season,
      status: this.props.status,
      matchDate: this.props.matchDate,
      venue: this.props.venue,
      score: this.props.homeScore !== undefined && this.props.awayScore !== undefined
        ? { home: this.props.homeScore, away: this.props.awayScore }
        : null,
      homeForm: this.props.homeForm ?? null,
      awayForm: this.props.awayForm ?? null,
      elapsed: this.props.elapsed ?? null,
      htHomeScore: this.props.htHomeScore ?? null,
      htAwayScore: this.props.htAwayScore ?? null,
      aetHomeScore: this.props.aetHomeScore ?? null,
      aetAwayScore: this.props.aetAwayScore ?? null,
      penHomeScore: this.props.penHomeScore ?? null,
      penAwayScore: this.props.penAwayScore ?? null,
      isKnockout: this.props.isKnockout === true,
      finalScore: this.getFinalScore(),
      penaltyWinner: this.getPenaltyWinner(),
      bettingContractAddress: this.props.bettingContractAddress,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
