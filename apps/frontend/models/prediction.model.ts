export { PredictionStatus } from '@chiliztv/domain';
export type { PredictionResponseDto as Prediction } from '@chiliztv/shared/dto/predictions/PredictionResponseDto';
export type { CreatePredictionDto as CreatePredictionRequest } from '@chiliztv/shared/dto/predictions/CreatePredictionDto';

export interface UserPredictionStats {
    userId: string;
    walletAddress: string;
    totalPredictions: number;
    totalWins: number;
    totalLosses: number;
    activePredictions: number;
    winRate: number;
}
