import type { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { Match } from '@chiliztv/domain/matches/entities/Match';

export interface ScenarioContext {
    readonly matchRepo: IMatchRepository;
    readonly blockchain: IBlockchainService;
    readonly clock: IClock;
    /** When false the scenario must not deploy on-chain (DB-only fast path). */
    readonly deployContracts: boolean;
}

export interface MatchScenarioOutcome {
    matchesCreated: number;
    contractsDeployed: number;
    /** Match IDs touched — used by the runner for opt-in cleanup-on-error. */
    matchIds: ReadonlyArray<number>;
    warnings: ReadonlyArray<string>;
}

export interface MatchScenario {
    readonly name: string;
    readonly description: string;
    apply(ctx: ScenarioContext): Promise<MatchScenarioOutcome>;
}

/**
 * Persists the match, then (when `deployContracts` is true) mirrors the prod
 * `SyncMatchesUseCase.createNewMatch` flow:
 *   1. deploy a FootballPariMatch proxy via the factory
 *   2. seed the 3 default markets (WINNER + GOALS_TOTAL + BOTH_SCORE) and
 *      open them — no odds parameter in parimutuel
 *   3. update the persisted match with the `bettingContractAddress`
 *
 * Returns the count of contracts deployed (0 or 1).
 */
export async function persistAndMaybeDeploy(
    match: Match,
    ctx: ScenarioContext,
    warnings: string[],
): Promise<number> {
    const saved = await ctx.matchRepo.save(match);
    if (!ctx.deployContracts) return 0;
    const json = saved.toJSON();
    try {
        const matchName = `${json.homeTeam.name} vs ${json.awayTeam.name}`;
        const adminAddress = ctx.blockchain.getAdminAddress();
        const { contractAddress } = await ctx.blockchain.deployBettingContract(matchName, adminAddress);
        await ctx.blockchain.setupDefaultMarkets(contractAddress);

        const withContract = Match.reconstitute({
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
            status: json.status,
            matchDate: new Date(json.matchDate),
            venue: json.venue,
            homeScore: json.score?.home,
            awayScore: json.score?.away,
            odds: json.odds,
            bettingContractAddress: contractAddress,
            createdAt: new Date(json.createdAt),
            updatedAt: ctx.clock.now(),
        });
        await ctx.matchRepo.update(withContract);
        return 1;
    } catch (err) {
        warnings.push(`deploy/setup failed for match ${json.id}: ${err instanceof Error ? err.message : String(err)}`);
        return 0;
    }
}
