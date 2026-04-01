export class MatchFetchWindow {
  static readonly FETCH_DAYS_AHEAD = 7;
  static readonly CLEANUP_HOURS_AFTER = 24;

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

  static cleanupBefore(now: Date): Date {
    const before = new Date(now);
    before.setHours(before.getHours() - MatchFetchWindow.CLEANUP_HOURS_AFTER);
    return before;
  }
}
