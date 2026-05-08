import type {
  FlatMatch,
  LeagueDto,
  SortMode,
  SortOption,
  StreamerCard,
} from "./types";

const LIVE_STATUSES = new Set(["1H", "2H", "ET", "BT", "P", "LIVE"]);

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function isLive(status: string): boolean {
  return LIVE_STATUSES.has(status);
}

/**
 * In-game minute, clamped to the half / extra-time window.
 *
 * `now` is nullable because pages start with a `null` clock to avoid SSR
 * hydration mismatches (server `new Date()` ≠ client `new Date()`); the
 * real value is set after mount.
 */
export function getMinute(
  status: string,
  kickoffAt: string,
  now: Date | null,
): number | null {
  if (!now) return null;
  const elapsed = Math.floor(
    (now.getTime() - new Date(kickoffAt).getTime()) / 60_000,
  );
  if (status === "1H") return clamp(elapsed, 0, 45);
  if (status === "2H") return clamp(elapsed, 46, 90);
  if (status === "ET") return clamp(elapsed, 90, 120);
  return elapsed;
}

/**
 * Pretty countdown until kickoff — `Now`, `in 12m`, `in 1h 24m`.
 *
 * Falls back to the formatted kickoff time when `now` is null (pre-hydration),
 * so the SSR markup stays deterministic.
 */
export function getCountdown(kickoffAt: string, now: Date | null): string {
  if (!now) {
    return new Date(kickoffAt).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const diff = Math.floor(
    (new Date(kickoffAt).getTime() - now.getTime()) / 60_000,
  );
  if (diff <= 0) return "Now";
  if (diff < 60) return `in ${diff}m`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
}

/** Compact viewer count: 1.4K / 12.0K / 1.2M. */
export function fmtViewers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Flatten leagues→matches into a single list with league context attached. */
export function flattenMatches(leagues: LeagueDto[]): FlatMatch[] {
  return leagues.flatMap((l) =>
    l.matches.map((m) => ({
      ...m,
      leagueId: l.league.id,
      leagueName: l.league.name,
      leagueLogo: l.league.logoUrl,
    })),
  );
}

/** Sort top viewers and flag the first as `featured`. */
export function buildStreams(
  matches: FlatMatch[],
  limit = 8,
): StreamerCard[] {
  return matches
    .flatMap((m) =>
      m.streamsPreview.map<StreamerCard>((sp) => ({
        ...sp,
        matchId: m.id,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        score: m.score,
        leagueName: m.leagueName,
      })),
    )
    .sort((a, b) => b.viewers - a.viewers)
    .slice(0, limit)
    .map((s, i) => ({ ...s, featured: i === 0 }));
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "time_asc", label: "Time ↑" },
  { value: "time_desc", label: "Time ↓" },
  { value: "league_asc", label: "League ↑" },
  { value: "league_desc", label: "League ↓" },
];

/** A homogeneous bucket of matches for one league, ready to render. */
export interface LeagueGroup {
  leagueId: number;
  leagueName: string;
  leagueLogo: string | null;
  matches: FlatMatch[];
}

/**
 * Bucket matches by league, preserving the input order within each bucket.
 * Buckets themselves are sorted by league name `asc` or `desc`. Returns a
 * fresh array — does not mutate `matches`.
 */
export function groupByLeague(
  matches: FlatMatch[],
  direction: "asc" | "desc" = "asc",
): LeagueGroup[] {
  const map = new Map<number, LeagueGroup>();
  for (const m of matches) {
    let bucket = map.get(m.leagueId);
    if (!bucket) {
      bucket = {
        leagueId: m.leagueId,
        leagueName: m.leagueName,
        leagueLogo: m.leagueLogo,
        matches: [],
      };
      map.set(m.leagueId, bucket);
    }
    bucket.matches.push(m);
  }
  const groups = Array.from(map.values());
  groups.sort((a, b) =>
    direction === "asc"
      ? a.leagueName.localeCompare(b.leagueName)
      : b.leagueName.localeCompare(a.leagueName),
  );
  return groups;
}

export function sortMatches(matches: FlatMatch[], mode: SortMode): FlatMatch[] {
  const cp = matches.slice();
  switch (mode) {
    case "time_asc":
      return cp.sort(
        (a, b) =>
          new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime(),
      );
    case "time_desc":
      return cp.sort(
        (a, b) =>
          new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime(),
      );
    case "league_asc":
      return cp.sort((a, b) => a.leagueName.localeCompare(b.leagueName));
    case "league_desc":
      return cp.sort((a, b) => b.leagueName.localeCompare(a.leagueName));
    default:
      return cp;
  }
}
