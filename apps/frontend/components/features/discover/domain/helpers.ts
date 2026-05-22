import type {
  FlatMatch,
  LeagueDto,
  SortMode,
  SortOption,
  StreamerCard,
} from "./types";
import { classifyStatus } from "@chiliztv/domain/matches/policies/BettablePolicy";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// Source de vérité dans le domain — interdit d'importer LIVE_STATUSES local
// (ESLint rule `no-restricted-imports` dans eslint.config.mjs). Le set
// historique côté front oubliait `HT`, ce qui motivait toute la refonte
// no-live-betting.
export function isLive(status: string): boolean {
  return classifyStatus(status) === "live";
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

/**
 * USDC raw (6-decimal bigint string) → whole-dollar integer, suitable for
 * rendering as "48 214" or "1 247 pts" in headline copy. Returns 0 when
 * input is null/undefined/unparsable so the UI stays NaN-free.
 */
export function usdcRawToWhole(raw: string | null | undefined): number {
    if (!raw) return 0;
    try {
        return Math.floor(Number(raw) / 1_000_000);
    } catch {
        return 0;
    }
}

/**
 * Format an integer with non-breaking spaces as thousand separators —
 * matches the "$48 214" display from the design (locale-independent).
 */
export function fmtNbsp(n: number): string {
    return n.toLocaleString("en-US").replace(/,/g, " ");
}

/**
 * Compact USDC display from a raw 6-decimal bigint. Renders `$1.2K`,
 * `$48K`, `$1.4M`. Returns "—" when the input is falsy. Matches the
 * design's `fmtUSD` thresholds.
 */
export function fmtUsdcCompact(raw: bigint | null | undefined): string {
    if (raw === null || raw === undefined) return "—";
    const usd = Number(raw) / 1_000_000;
    if (!Number.isFinite(usd) || usd <= 0) return "$0";
    if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (usd >= 10_000) return `$${Math.round(usd / 1_000)}K`;
    if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    return `$${usd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/**
 * Squeeze a team name down to a 3-4 letter short label suitable for tight
 * legend rows (e.g. donut card outcome lines). First word if short enough,
 * otherwise the first three letters — always upper-cased.
 */
export function shortName(name: string): string {
    const trimmed = name.trim();
    const first = trimmed.split(/\s+/)[0] ?? trimmed;
    return first.length <= 4 ? first.toUpperCase() : first.slice(0, 3).toUpperCase();
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
