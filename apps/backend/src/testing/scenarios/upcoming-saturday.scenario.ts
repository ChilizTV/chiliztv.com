import { matchFixture, nextTestMatchId } from '../fixtures/match.fixtures';
import type { MatchScenario, MatchScenarioOutcome, ScenarioContext } from './types';
import { persistAndMaybeDeploy } from './types';

interface FixtureEntry {
    home: string;
    away: string;
    league: { id: number; name: string };
    offsetMin: number;
}

const ONE_MONTH_MIN = 30 * 24 * 60;

const FIXTURES: ReadonlyArray<FixtureEntry> = [
    { home: 'Paris Saint-Germain', away: 'Olympique de Marseille', league: { id: 61,  name: 'Ligue 1' },        offsetMin: ONE_MONTH_MIN + 60  },
    { home: 'Manchester City',     away: 'Arsenal',                league: { id: 39,  name: 'Premier League' }, offsetMin: ONE_MONTH_MIN + 75  },
    { home: 'Real Madrid',         away: 'Barcelona',              league: { id: 140, name: 'La Liga' },        offsetMin: ONE_MONTH_MIN + 90  },
    { home: 'Bayern',              away: 'Dortmund',               league: { id: 78,  name: 'Bundesliga' },     offsetMin: ONE_MONTH_MIN + 105 },
];

// 4 upcoming matches across 4 leagues, kicking off ~1 month after clock.now()
// to leave plenty of headroom for end-to-end test runs.
// Exercises the Discover grid (multiple matches, multiple leagues).
export const upcomingSaturdayScenario: MatchScenario = {
    name: 'upcoming-saturday',
    description: '4 upcoming matches across 4 leagues, kickoff ~1 month ahead. Discover-grid happy path.',
    async apply(ctx: ScenarioContext): Promise<MatchScenarioOutcome> {
        const warnings: string[] = [];
        const matchIds: number[] = [];
        let contractsDeployed = 0;
        for (const entry of FIXTURES) {
            const match = matchFixture.upcoming({
                apiFootballId: nextTestMatchId(),
                homeTeam: { name: entry.home },
                awayTeam: { name: entry.away },
                league: entry.league,
                kickoffAt: new Date(ctx.clock.now().getTime() + entry.offsetMin * 60_000),
            });
            matchIds.push(match.getId());
            contractsDeployed += await persistAndMaybeDeploy(match, ctx, warnings);
        }
        return {
            matchesCreated: matchIds.length,
            contractsDeployed,
            matchIds,
            warnings,
        };
    },
};
