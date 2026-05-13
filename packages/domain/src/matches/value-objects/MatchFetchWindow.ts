export class MatchFetchWindow {
  // Bound used by the sync job (API-Football fetch). The front-facing query
  // path is unbounded in the future — only the sync window caps it.
  static readonly FETCH_DAYS_AHEAD = 7;
  static readonly CLEANUP_HOURS_AFTER = 24;
  static readonly DISPLAY_HOURS_BEHIND = 24;

  static fetchFrom(now: Date): Date {
    const from = new Date(now);
    from.setDate(from.getDate() - 1);
    return from;
  }

  static fetchTo(now: Date): Date {
    const to = new Date(now);
    to.setDate(to.getDate() + MatchFetchWindow.FETCH_DAYS_AHEAD);
    return to;
  }

  // Lower bound for the front display window: every future match + matches
  // whose kickoff was within the last 24h (covers freshly finished games).
  static displayFrom(now: Date): Date {
    const from = new Date(now);
    from.setHours(from.getHours() - MatchFetchWindow.DISPLAY_HOURS_BEHIND);
    return from;
  }

  static cleanupBefore(now: Date): Date {
    const before = new Date(now);
    before.setHours(before.getHours() - MatchFetchWindow.CLEANUP_HOURS_AFTER);
    return before;
  }
}
