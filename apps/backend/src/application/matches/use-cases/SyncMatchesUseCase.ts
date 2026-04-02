import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { IFootballApiService, RawMatch, ExtendedOdds } from '@chiliztv/domain/shared/ports/IFootballApiService';
import { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import { Match, MatchOdds } from '@chiliztv/domain/matches/entities/Match';

export interface SyncMatchesResult {
    matchesFetched: number;
    matchesStored: number;
    contractsDeployed: number;
}

/**
 * SyncMatchesUseCase
 * Orchestrates match synchronization:
 *  1. Fetch raw matches from IFootballApiService (domain port)
 *  2. Fetch odds via the same port
 *  3. Persist matches via IMatchRepository
 *  4. Deploy betting contracts via IBlockchainService (domain port)
 *  5. Sync odds to existing contracts
 *
 * No infrastructure imports — only domain ports and entities.
 */
@injectable()
export class SyncMatchesUseCase {
    constructor(
        @inject(TOKENS.IMatchRepository)
        private readonly matchRepository: IMatchRepository,
        @inject(TOKENS.IFootballApiService)
        private readonly footballApiService: IFootballApiService,
        @inject(TOKENS.IBlockchainService)
        private readonly blockchainService: IBlockchainService
    ) {}

    async execute(): Promise<SyncMatchesResult> {
        // Step 1: Fetch matches (domain RawMatch — no ApiFootball types)
        const rawMatches = await this.footballApiService.fetchMatches(MatchFetchWindow.FETCH_DAYS_AHEAD);

        if (rawMatches.length === 0) {
            return { matchesFetched: 0, matchesStored: 0, contractsDeployed: 0 };
        }

        // Step 2: Fetch odds — returns Map<apiFootballId, ExtendedOdds>
        const matchIds = rawMatches.map(m => m.apiFootballId);
        const oddsMap  = await this.footballApiService.fetchOddsForMatches(matchIds);

        // Step 3: Persist matches and manage contracts
        let matchesStored    = 0;
        let contractsDeployed = 0;

        for (const raw of rawMatches) {
            try {
                const extendedOdds = oddsMap.get(raw.apiFootballId) ?? null;
                const matchOdds    = this.toMatchOdds(extendedOdds);

                const existing = await this.matchRepository.findByApiFootballId(raw.apiFootballId);

                if (existing) {
                    await this.updateExistingMatch(existing, raw, matchOdds, extendedOdds);
                    matchesStored++;
                } else {
                    const deployed = await this.createNewMatch(raw, matchOdds, extendedOdds);
                    matchesStored++;
                    if (deployed) contractsDeployed++;
                }
            } catch {
                // Individual match failures do not abort the full sync
            }
        }

        return { matchesFetched: rawMatches.length, matchesStored, contractsDeployed };
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private async updateExistingMatch(
        existing: Match,
        raw: RawMatch,
        matchOdds: MatchOdds | undefined,
        extendedOdds: ExtendedOdds | null
    ): Promise<void> {
        const existingJson = existing.toJSON();

        const updated = Match.reconstitute({
            id:                     existingJson.id,
            apiFootballId:          raw.apiFootballId,
            homeTeamId:             raw.homeTeamId,
            homeTeamName:           raw.homeTeamName,
            homeTeamLogo:           raw.homeTeamLogo,
            awayTeamId:             raw.awayTeamId,
            awayTeamName:           raw.awayTeamName,
            awayTeamLogo:           raw.awayTeamLogo,
            leagueId:               raw.leagueId,
            leagueName:             raw.leagueName,
            leagueLogo:             raw.leagueLogo,
            leagueCountry:          raw.leagueCountry,
            season:                 raw.season,
            status:                 raw.status,
            matchDate:              raw.matchDate,
            venue:                  raw.venue,
            homeScore:              raw.homeScore ?? undefined,
            awayScore:              raw.awayScore ?? undefined,
            odds:                   matchOdds,
            bettingContractAddress: existing.getBettingContractAddress(),
            createdAt:              existingJson.createdAt,
            updatedAt:              new Date(),
        });

        await this.matchRepository.update(updated);

        // Sync odds to blockchain if contract exists
        const contractAddress = existing.getBettingContractAddress();
        if (contractAddress && extendedOdds) {
            try {
                await this.blockchainService.syncOdds(contractAddress, extendedOdds);
            } catch {
                // Non-fatal: odds sync failure does not fail the use case
            }
        }
    }

    private async createNewMatch(
        raw: RawMatch,
        matchOdds: MatchOdds | undefined,
        extendedOdds: ExtendedOdds | null
    ): Promise<boolean> {
        const newMatch = Match.create({
            id:            raw.apiFootballId,
            apiFootballId: raw.apiFootballId,
            homeTeamId:    raw.homeTeamId,
            homeTeamName:  raw.homeTeamName,
            homeTeamLogo:  raw.homeTeamLogo,
            awayTeamId:    raw.awayTeamId,
            awayTeamName:  raw.awayTeamName,
            awayTeamLogo:  raw.awayTeamLogo,
            leagueId:      raw.leagueId,
            leagueName:    raw.leagueName,
            leagueLogo:    raw.leagueLogo,
            leagueCountry: raw.leagueCountry,
            season:        raw.season,
            status:        raw.status,
            matchDate:     raw.matchDate,
            venue:         raw.venue,
            homeScore:     raw.homeScore ?? undefined,
            awayScore:     raw.awayScore ?? undefined,
            odds:          matchOdds,
        });

        const saved = await this.matchRepository.save(newMatch);

        if (!extendedOdds) return false;

        try {
            const matchName     = `${raw.homeTeamName} vs ${raw.awayTeamName}`;
            const ownerAddress  = this.blockchainService.getAdminAddress();
            const { contractAddress } = await this.blockchainService.deployBettingContract(
                matchName,
                ownerAddress
            );

            await this.blockchainService.setupMarkets(contractAddress, extendedOdds);

            const matchWithContract = Match.reconstitute({
                ...saved.toJSON(),
                bettingContractAddress: contractAddress,
                updatedAt: new Date(),
            });
            await this.matchRepository.update(matchWithContract);

            return true;
        } catch {
            return false;
        }
    }

    /** Convert domain ExtendedOdds to MatchOdds stored on the Match entity. */
    private toMatchOdds(odds: ExtendedOdds | null): MatchOdds | undefined {
        if (!odds) return undefined;
        return { homeWin: odds.homeWin, draw: odds.draw, awayWin: odds.awayWin };
    }
}
