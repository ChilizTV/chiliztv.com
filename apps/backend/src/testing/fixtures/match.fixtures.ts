import { Match } from '@chiliztv/domain/matches/entities/Match';

export interface MatchFixtureOverride {
    apiFootballId?: number;
    homeTeam?: { id?: number; name: string; logo?: string };
    awayTeam?: { id?: number; name: string; logo?: string };
    league?: { id?: number; name: string; country?: string; logo?: string };
    kickoffAt?: Date;
    score?: { home: number; away: number };
    /** Aggregate score after extra time — needed for AET / PEN fixtures to drive FULL_TIME_WINNER. */
    aetScore?: { home: number; away: number };
    /** Penalty shootout result — needed for PEN fixtures. */
    penScore?: { home: number; away: number };
    bettingContractAddress?: string;
    homeForm?: string | null;
    awayForm?: string | null;
    venue?: string;
    /** When true, the seeded proxy includes the FULL_TIME_WINNER market (9 markets instead of 8). */
    isKnockout?: boolean;
}

const FIXTURE_ID_START = 999000;
let nextId = FIXTURE_ID_START;

export function nextTestMatchId(): number {
    return nextId++;
}

/** Resets the in-module counter — call from `beforeEach` to keep tests isolated. */
export function __resetTestMatchIdForTesting(): void {
    nextId = FIXTURE_ID_START;
}

interface BuildArgs {
    status: string;
    kickoffOffsetMs: number;
    score?: { home: number; away: number };
    /** Default knockout flag for this fixture kind — overridable per call via MatchFixtureOverride.isKnockout. */
    isKnockout?: boolean;
}

const DEFAULT_HOME = { id: 5, name: 'Inter', logo: '' };
const DEFAULT_AWAY = { id: 7, name: 'AC Milan', logo: '' };
const DEFAULT_LEAGUE = { id: 135, name: 'Serie A', country: 'Italy', logo: '' };
const DEFAULT_VENUE = 'San Siro';

function buildMatch(args: BuildArgs, override?: MatchFixtureOverride): Match {
    const id = override?.apiFootballId ?? nextTestMatchId();
    const homeTeam = { ...DEFAULT_HOME, ...override?.homeTeam };
    const awayTeam = { ...DEFAULT_AWAY, ...override?.awayTeam };
    const league   = { ...DEFAULT_LEAGUE, ...override?.league };
    const kickoff  = override?.kickoffAt ?? new Date(Date.now() + args.kickoffOffsetMs);
    const score    = override?.score ?? args.score;

    return Match.create({
        id,
        apiFootballId: id,
        homeTeamId: homeTeam.id ?? DEFAULT_HOME.id,
        homeTeamName: homeTeam.name,
        homeTeamLogo: homeTeam.logo,
        awayTeamId: awayTeam.id ?? DEFAULT_AWAY.id,
        awayTeamName: awayTeam.name,
        awayTeamLogo: awayTeam.logo,
        leagueId: league.id ?? DEFAULT_LEAGUE.id,
        leagueName: league.name,
        leagueLogo: league.logo,
        leagueCountry: league.country,
        season: kickoff.getFullYear(),
        status: args.status,
        matchDate: kickoff,
        venue: override?.venue ?? DEFAULT_VENUE,
        homeScore: score?.home,
        awayScore: score?.away,
        aetHomeScore: override?.aetScore?.home ?? null,
        aetAwayScore: override?.aetScore?.away ?? null,
        penHomeScore: override?.penScore?.home ?? null,
        penAwayScore: override?.penScore?.away ?? null,
        isKnockout: override?.isKnockout ?? args.isKnockout ?? false,
        homeForm: override?.homeForm ?? null,
        awayForm: override?.awayForm ?? null,
        bettingContractAddress: override?.bettingContractAddress,
    });
}

const MIN  = 60_000;
const HOUR = 60 * MIN;

/**
 * Fixtures cover every `MatchStatusKind` the codebase classifies. Defaults
 * mirror what `SyncMatchesUseCase.createNewMatch` would produce in prod —
 * keep this list in sync when `Match.create` shape evolves.
 */
export const matchFixture = {
    upcoming:        (o?: MatchFixtureOverride) => buildMatch({ status: 'NS',  kickoffOffsetMs:  60 * MIN }, o),
    kickoffImminent: (o?: MatchFixtureOverride) => buildMatch({ status: 'NS',  kickoffOffsetMs:  90_000 }, o),
    firstHalf:       (o?: MatchFixtureOverride) => buildMatch({ status: '1H',  kickoffOffsetMs: -10 * MIN, score: { home: 0, away: 0 } }, o),
    halftime:        (o?: MatchFixtureOverride) => buildMatch({ status: 'HT',  kickoffOffsetMs: -50 * MIN, score: { home: 1, away: 0 } }, o),
    secondHalf:      (o?: MatchFixtureOverride) => buildMatch({ status: '2H',  kickoffOffsetMs: -70 * MIN, score: { home: 1, away: 1 } }, o),
    extraTime:       (o?: MatchFixtureOverride) => buildMatch({ status: 'ET',  kickoffOffsetMs: -95 * MIN, score: { home: 1, away: 1 } }, o),
    breakTime:       (o?: MatchFixtureOverride) => buildMatch({ status: 'BT',  kickoffOffsetMs: -91 * MIN, score: { home: 1, away: 1 } }, o),
    penalty:         (o?: MatchFixtureOverride) => buildMatch({ status: 'P',   kickoffOffsetMs: -120 * MIN, score: { home: 2, away: 2 } }, o),
    suspended:       (o?: MatchFixtureOverride) => buildMatch({ status: 'SUSP',kickoffOffsetMs: -25 * MIN, score: { home: 0, away: 0 } }, o),
    interrupted:     (o?: MatchFixtureOverride) => buildMatch({ status: 'INT', kickoffOffsetMs: -25 * MIN, score: { home: 0, away: 0 } }, o),
    fullTime:        (o?: MatchFixtureOverride) => buildMatch({ status: 'FT',  kickoffOffsetMs: -2 * HOUR, score: { home: 2, away: 1 } }, o),
    // AET / PEN fixtures default `isKnockout: true` since these statuses only
    // occur in knockout fixtures. Override to false on a per-call basis if a
    // test needs to exercise the "AET on a non-knockout proxy" edge.
    afterExtraTime:  (o?: MatchFixtureOverride) => buildMatch({ status: 'AET', kickoffOffsetMs: -3 * HOUR, score: { home: 2, away: 2 }, isKnockout: true }, o),
    afterPenalties:  (o?: MatchFixtureOverride) => buildMatch({ status: 'PEN', kickoffOffsetMs: -3 * HOUR, score: { home: 3, away: 2 }, isKnockout: true }, o),
    /** Knockout fixture in NS — useful to exercise the 9-market seed lineup without waiting for AET/PEN status. */
    upcomingKnockout: (o?: MatchFixtureOverride) => buildMatch({ status: 'NS', kickoffOffsetMs: 60 * MIN, isKnockout: true }, o),
    postponed:       (o?: MatchFixtureOverride) => buildMatch({ status: 'PST', kickoffOffsetMs: 24 * HOUR }, o),
    cancelled:       (o?: MatchFixtureOverride) => buildMatch({ status: 'CANC',kickoffOffsetMs: -30 * MIN }, o),
    abandoned:       (o?: MatchFixtureOverride) => buildMatch({ status: 'ABD', kickoffOffsetMs: -30 * MIN, score: { home: 1, away: 1 } }, o),
    awarded:         (o?: MatchFixtureOverride) => buildMatch({ status: 'AWD', kickoffOffsetMs: -2 * HOUR, score: { home: 3, away: 0 } }, o),
    walkover:        (o?: MatchFixtureOverride) => buildMatch({ status: 'WO',  kickoffOffsetMs: -2 * HOUR, score: { home: 3, away: 0 } }, o),
} as const;

export type FixtureName = keyof typeof matchFixture;
