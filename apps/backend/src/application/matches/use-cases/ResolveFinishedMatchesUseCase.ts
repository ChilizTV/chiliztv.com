import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { IBlockchainService } from '@chiliztv/domain/shared/ports/IBlockchainService';
import { logger } from '../../../infrastructure/logging/logger';

export interface ResolveFinishedMatchesResult {
    matchesProcessed: number;
    marketsResolved: number;
}

/**
 * ResolveFinishedMatchesUseCase
 * Resolves on-chain betting markets for finished matches.
 * Uses IBlockchainService port — no infrastructure imports.
 */
@injectable()
export class ResolveFinishedMatchesUseCase {
    /** Per-contract guard — SyncMatchesJob and ResolveMarketsJob both fire on startup and race on `resolveMarketsBatch`. */
    private readonly inFlight = new Set<string>();

    constructor(
        @inject(TOKENS.IMatchRepository)
        private readonly matchRepository: IMatchRepository,
        @inject(TOKENS.IBlockchainService)
        private readonly blockchainService: IBlockchainService
    ) {}

    async execute(): Promise<ResolveFinishedMatchesResult> {
        const allMatches = await this.matchRepository.findAll();

        // Resolve markets for any finished match — FT (90'), AET (after extra
        // time), or PEN (after penalty shootout). All three reach a final
        // state where the WINNER market can be settled on the 90' score
        // (json.score.{home,away}). FULL_TIME_WINNER (future, knockout-only)
        // will rely on the AET/PEN-specific fields once the contract supports them.
        const FINISHED_STATUSES = ['FT', 'AET', 'PEN'] as const;
        const toResolve = allMatches.filter(match => {
            const json = match.toJSON();
            return (
                FINISHED_STATUSES.includes(json.status as typeof FINISHED_STATUSES[number]) &&
                json.score?.home != null &&
                json.score?.away != null &&
                json.bettingContractAddress &&
                String(json.bettingContractAddress).trim() !== ''
            );
        });

        if (toResolve.length === 0) {
            return { matchesProcessed: 0, marketsResolved: 0 };
        }

        let marketsResolved = 0;
        let matchesProcessed = 0;

        for (const match of toResolve) {
            const json = match.toJSON();
            const addr = json.bettingContractAddress!.toLowerCase();
            if (this.inFlight.has(addr)) continue;
            this.inFlight.add(addr);

            // Observability — surface missed knockout detection.
            // A match that reached AET / PEN MUST have been flagged knockout
            // at create (otherwise the FULL_TIME_WINNER market is absent
            // on-chain and stakers will only see the WINNER (90') market).
            // This warn lets us identify competitions the KnockoutMatchPolicy
            // mis-classified and tune the rules (e.g. add a new round regex).
            if (
                (json.status === 'AET' || json.status === 'PEN')
                && json.isKnockout !== true
            ) {
                logger.warn(
                    'Match went to AET/PEN but was not flagged knockout — FULL_TIME_WINNER market is missing',
                    {
                        matchId: json.id,
                        apiFootballId: json.apiFootballId,
                        leagueId: json.league?.id,
                        leagueName: json.league?.name,
                        status: json.status,
                    },
                );
            }
            try {
                // Pass HT scores when known so the HALFTIME market resolves
                // here in the FT fallback path (if SyncLiveMatchesJob /
                // ResolveHalftimeMarketsJob both missed it). When HT scores
                // are still null, the adapter defaults them to 0 — the
                // contract void-protects the HALFTIME market on a 0-0 ghost
                // resolve (winningPool == 0 → Cancelled, stakers refund).
                //
                // For AET/PEN matches, also pass the extra-time aggregate and
                // the penalty-shootout winner so FULL_TIME_WINNER resolves on
                // the true final result. For FT matches the AET fields equal
                // the 90' score (adapter default) and penWinner=255 means "no
                // shootout occurred" — FULL_TIME_WINNER then falls back to
                // the 90' winner, consistent with WINNER.
                const penWinner: number | undefined = match.getPenaltyWinner() === 'home'
                    ? 0
                    : match.getPenaltyWinner() === 'away'
                        ? 1
                        : undefined; // adapter defaults to 255 (PEN_WINNER_NONE)
                const count = await this.blockchainService.resolveMarketsByScore(
                    json.bettingContractAddress!,
                    {
                        homeGoals: json.score!.home!,
                        awayGoals: json.score!.away!,
                        htHomeGoals: json.htHomeScore ?? undefined,
                        htAwayGoals: json.htAwayScore ?? undefined,
                        aetHomeGoals: json.aetHomeScore ?? undefined,
                        aetAwayGoals: json.aetAwayScore ?? undefined,
                        penWinner,
                    },
                );
                marketsResolved += count;
                matchesProcessed += 1;
            } catch {
                // Non-fatal: continue resolving other matches
            } finally {
                this.inFlight.delete(addr);
            }
        }

        return { matchesProcessed, marketsResolved };
    }
}
