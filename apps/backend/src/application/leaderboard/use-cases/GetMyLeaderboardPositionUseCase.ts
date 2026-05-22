import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { ILeaderboardScoreRepository } from '@chiliztv/domain/leaderboard/repositories/ILeaderboardScoreRepository';

export interface MyLeaderboardPositionResult {
    readonly userAddress: string;
    readonly rank: number | null;
    readonly totalScore: string;
}

@injectable()
export class GetMyLeaderboardPositionUseCase {
    constructor(
        @inject(TOKENS.ILeaderboardScoreRepository)
        private readonly scoreRepo: ILeaderboardScoreRepository,
    ) {}

    async execute(userAddress: string): Promise<MyLeaderboardPositionResult> {
        const normalized = userAddress.toLowerCase();
        const [score, rank] = await Promise.all([
            this.scoreRepo.getScoreForUser(normalized),
            this.scoreRepo.getRank(normalized),
        ]);
        return {
            userAddress: normalized,
            rank,
            totalScore: (score?.totalScore ?? 0n).toString(),
        };
    }
}
