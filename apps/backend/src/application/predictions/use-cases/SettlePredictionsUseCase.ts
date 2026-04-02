import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IPredictionRepository } from '@chiliztv/domain/predictions/repositories/IPredictionRepository';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
/**
 * Settle Predictions Use Case
 * Automatically settles predictions based on finished match results.
 */
@injectable()
export class SettlePredictionsUseCase {
    constructor(
        @inject(TOKENS.IPredictionRepository) private readonly predictionRepository: IPredictionRepository,
        @inject(TOKENS.IMatchRepository) private readonly matchRepository: IMatchRepository
    ) {}

    async execute(): Promise<number> {
        const predictions = await this.predictionRepository.findPendingForSettlement();
        if (predictions.length === 0) return 0;

        let settledCount = 0;

        for (const prediction of predictions) {
            try {
                const match = await this.matchRepository.findByApiFootballId(prediction.getMatchId());
                if (!match) continue;
                if (match.getStatus() !== 'FT') continue;

                const homeScore = match.getHomeScore();
                const awayScore = match.getAwayScore();
                if (homeScore == null || awayScore == null) continue;

                const predictionType  = prediction.getPredictionType();
                const predictionValue = prediction.getPredictionValue();
                const isWin           = this.determineResult(homeScore, awayScore, predictionType, predictionValue);
                const actualResult    = this.getActualResult(homeScore, awayScore, predictionType);

                prediction.settle(actualResult, isWin);
                await this.predictionRepository.update(prediction);
                settledCount++;
            } catch {
                // Non-fatal: continue with remaining predictions
            }
        }

        return settledCount;
    }

    /**
     * Determine if the prediction won based on match result
     */
    private determineResult(
        homeScore: number,
        awayScore: number,
        predictionType: string,
        predictionValue: string
    ): boolean {
        // Handle frontend prediction types (WIN_HOME, WIN_AWAY, DRAW)
        if (predictionType === 'WIN_HOME') {
            return homeScore > awayScore;
        } else if (predictionType === 'WIN_AWAY') {
            return awayScore > homeScore;
        } else if (predictionType === 'DRAW') {
            return homeScore === awayScore;
        }

        // Handle legacy match_winner format
        if (predictionType === 'match_winner') {
            if (predictionValue === 'home') {
                return homeScore > awayScore;
            } else if (predictionValue === 'away') {
                return awayScore > homeScore;
            } else if (predictionValue === 'draw') {
                return homeScore === awayScore;
            }
        } else if (predictionType === 'first_half_winner') {
            // For first half, we would need HT scores from the match data
            // For now, return false as we don't have HT scores in schema
            return false;
        }

        return false;
    }

    /**
     * Get the actual result string from scores
     */
    private getActualResult(homeScore: number, awayScore: number, predictionType: string): string {
        // For WIN_HOME, WIN_AWAY, DRAW types, return the actual match result
        if (predictionType === 'WIN_HOME' || predictionType === 'WIN_AWAY' || predictionType === 'DRAW' || predictionType === 'match_winner') {
            if (homeScore > awayScore) {
                return 'WIN_HOME';
            } else if (awayScore > homeScore) {
                return 'WIN_AWAY';
            } else {
                return 'DRAW';
            }
        }
        return 'unknown';
    }
}
