import { injectable, inject } from 'tsyringe';
import * as readline from 'readline';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { Match } from '@chiliztv/domain/matches/entities/Match';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { PariMatchDeploymentAdapter } from '../../../infrastructure/blockchain/adapters/PariMatchDeploymentAdapter';
import { matchFixture } from '../../../testing/fixtures/match.fixtures';
import { logger } from '../../../infrastructure/logging/logger';

/**
 * Interactive lifecycle helper around the legacy fixture (api_football_id =
 * 999004, Inter vs AC Milan). Surface unchanged from the historical CLI;
 * internals now route through:
 *   - `matchFixture.upcoming(...)` for the initial create (no duplicated
 *     `Match.create` payload),
 *   - `transitionStatus(...)` for the status updates,
 *   - `IClock` for every "the present moment" lookup.
 *
 * For richer scenarios (HT, kickoff buffer, CANC, multi-match), use
 * `pnpm match:scenario`.
 */
@injectable()
export class TestMatchLifecycleCommand {
    private readonly TEST_MATCH_ID = 999004;

    constructor(
        @inject(TOKENS.IMatchRepository) private readonly matchRepository: IMatchRepository,
        @inject(PariMatchDeploymentAdapter) private readonly deploymentAdapter: PariMatchDeploymentAdapter,
        @inject(TOKENS.IClock) private readonly clock: IClock,
    ) {}

    private ask(question: string): Promise<string> {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve((answer || '').trim());
            });
        });
    }

    private printMenu(): void {
        logger.info('─────────────────────────────────────────');
        logger.info(`  TEST MATCH LIFECYCLE (id=${this.TEST_MATCH_ID})`);
        logger.info('─────────────────────────────────────────');
        logger.info('  1  - Create match + deploy contract (status: not started NS)');
        logger.info('  2  - Set match to live (1H, score 0-0)');
        logger.info('  3  - Finish match with score (FT)');
        logger.info('  4  - Show match status');
        logger.info('  q  - Quit');
        logger.info('─────────────────────────────────────────');
    }

    private async createTestMatch(): Promise<void> {
        const kickoff = new Date(this.clock.now().getTime() + 2 * 60 * 60_000);
        const match = matchFixture.upcoming({
            apiFootballId: this.TEST_MATCH_ID,
            homeTeam: { id: 5, name: 'Inter' },
            awayTeam: { id: 7, name: 'AC Milan' },
            league: { id: 3, name: 'Serie A', country: 'Italy' },
            kickoffAt: kickoff,
            venue: 'San Siro',
        });
        await this.matchRepository.save(match);

        const matchName = 'INTER vs ACM';
        const ownerAddress = this.deploymentAdapter.getAdminAddress();
        logger.info('Deploying FootballMatch contract');
        const contractAddress = await this.deploymentAdapter.deployFootballMatch(matchName, ownerAddress);
        await this.deploymentAdapter.setupDefaultMarkets(contractAddress, {
            isKnockout: match.toJSON().isKnockout === true,
        });

        const updated = this.cloneWith(match, { bettingContractAddress: contractAddress });
        await this.matchRepository.update(updated);
        logger.info('Test match created and contract deployed', {
            apiFootballId: this.TEST_MATCH_ID,
            contractAddress,
        });
    }

    private async transitionStatus(
        apiFootballId: number,
        status: string,
        score?: { home: number; away: number },
    ): Promise<void> {
        const match = await this.matchRepository.findByApiFootballId(apiFootballId);
        if (!match) throw new Error(`Match ${apiFootballId} not found`);
        const updated = this.cloneWith(match, { status, score });
        await this.matchRepository.update(updated);
        logger.info('Match transitioned', {
            apiFootballId,
            status,
            score: score ? `${score.home}-${score.away}` : '—',
        });
    }

    /**
     * Reconstitute the match with the same identity + the override applied.
     * The match entity exposes only flat-prop setters for `score` / `status`
     * via `updateScore` / `updateStatus`, so a full reconstitute is used here
     * to capture all overrides in one shot.
     */
    private cloneWith(
        match: Match,
        override: { status?: string; score?: { home: number; away: number }; bettingContractAddress?: string },
    ): Match {
        const json = match.toJSON();
        return Match.reconstitute({
            id: json.id,
            apiFootballId: json.apiFootballId,
            homeTeamId: json.homeTeam.id,
            homeTeamName: json.homeTeam.name,
            homeTeamLogo: json.homeTeam.logo,
            awayTeamId: json.awayTeam.id,
            awayTeamName: json.awayTeam.name,
            awayTeamLogo: json.awayTeam.logo,
            leagueId: json.league.id,
            leagueName: json.league.name,
            leagueLogo: json.league.logo,
            leagueCountry: json.league.country,
            season: json.season,
            status: override.status ?? json.status,
            matchDate: new Date(json.matchDate),
            venue: json.venue,
            homeScore: override.score?.home ?? json.score?.home,
            awayScore: override.score?.away ?? json.score?.away,
            homeForm: json.homeForm ?? null,
            awayForm: json.awayForm ?? null,
            bettingContractAddress: override.bettingContractAddress ?? json.bettingContractAddress,
            createdAt: new Date(json.createdAt),
            updatedAt: this.clock.now(),
        });
    }

    private async showStatus(apiFootballId: number): Promise<void> {
        const match = await this.matchRepository.findByApiFootballId(apiFootballId);
        if (!match) throw new Error(`Match ${apiFootballId} not found`);
        const json = match.toJSON();
        logger.info('Match status', {
            match: `${json.homeTeam.name} vs ${json.awayTeam.name}`,
            apiFootballId: json.apiFootballId,
            status: json.status,
            score: `${json.score?.home ?? '-'} - ${json.score?.away ?? '-'}`,
            contract: json.bettingContractAddress ?? '(none)',
        });
    }

    async executeInteractive(): Promise<void> {
        for (;;) {
            this.printMenu();
            const choice = await this.ask('Your choice (1/2/3/4/q): ');
            if (choice === 'q' || choice === 'Q') {
                logger.info('Goodbye');
                return;
            }
            try {
                if (choice === '1') {
                    await this.createTestMatch();
                } else if (choice === '2') {
                    await this.transitionStatus(this.TEST_MATCH_ID, '1H', { home: 0, away: 0 });
                } else if (choice === '3') {
                    const parts = (await this.ask('Score (e.g. 2 1 for 2-1): ')).split(/\s+/);
                    const h = parseInt(parts[0] ?? '0', 10);
                    const a = parseInt(parts[1] ?? '0', 10);
                    if (Number.isNaN(h) || Number.isNaN(a)) {
                        logger.warn('Enter two numbers (e.g. 2 1)');
                    } else {
                        await this.transitionStatus(this.TEST_MATCH_ID, 'FT', { home: h, away: a });
                    }
                } else if (choice === '4') {
                    await this.showStatus(this.TEST_MATCH_ID);
                } else {
                    logger.warn('Invalid choice. Type 1, 2, 3, 4 or q');
                }
            } catch (err) {
                logger.error('Error in interactive menu', { error: err instanceof Error ? err.message : String(err) });
            }
        }
    }

    async executeCli(command: string, args: string[]): Promise<void> {
        const getMatchId = (): number => {
            const id = args[0];
            if (id !== undefined) {
                const n = parseInt(id, 10);
                if (!Number.isNaN(n)) return n;
            }
            return this.TEST_MATCH_ID;
        };

        switch (command) {
            case 'create':
                await this.createTestMatch();
                return;
            case 'live':
                await this.transitionStatus(getMatchId(), '1H', { home: 0, away: 0 });
                return;
            case 'finished': {
                const [idOrH, hOrA, maybeA] = args;
                const id = args.length === 3 ? parseInt(idOrH ?? '', 10) : this.TEST_MATCH_ID;
                const h = parseInt((args.length === 3 ? hOrA : idOrH) ?? '', 10);
                const a = parseInt((args.length === 3 ? maybeA : hOrA) ?? '', 10);
                if (Number.isNaN(id) || Number.isNaN(h) || Number.isNaN(a)) {
                    throw new Error('Usage: finished [id] <home_score> <away_score>');
                }
                await this.transitionStatus(id, 'FT', { home: h, away: a });
                return;
            }
            case 'status':
                await this.showStatus(getMatchId());
                return;
            default:
                logger.info('Usage:');
                logger.info('  npx ts-node src/presentation/cli/test-match-lifecycle.ts           # Interactive');
                logger.info('  npx ts-node src/presentation/cli/test-match-lifecycle.ts create');
                logger.info('  npx ts-node src/presentation/cli/test-match-lifecycle.ts live [id]');
                logger.info('  npx ts-node src/presentation/cli/test-match-lifecycle.ts finished [id] <home> <away>');
                logger.info('  npx ts-node src/presentation/cli/test-match-lifecycle.ts status [id]');
                logger.info(`[id] default = ${this.TEST_MATCH_ID}`);
                logger.info('For richer scenarios (HT/CANC/multi-match), see `pnpm match:scenario list`.');
                throw new Error('Invalid command');
        }
    }

    async execute(argv: string[]): Promise<void> {
        try {
            const command = argv[2]?.toLowerCase();
            if (!command) {
                await this.executeInteractive();
            } else {
                await this.executeCli(command, argv.slice(3));
            }
        } catch (error) {
            logger.error('Test match lifecycle command failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
}
