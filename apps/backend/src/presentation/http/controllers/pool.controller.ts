import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import { GetLatestApyUseCase } from '../../../application/pool/use-cases/GetLatestApyUseCase';
import { GetPoolStateUseCase } from '../../../application/pool/use-cases/GetPoolStateUseCase';
import { PoolApySnapshot } from '@chiliztv/domain/blockchain-indexing/entities/PoolApySnapshot';
import type { PoolState } from '@chiliztv/domain/shared/ports/IPoolStateReader';

function serializeApy(snapshot: PoolApySnapshot | null): Record<string, unknown> | null {
    if (!snapshot) return null;
    return {
        windowLabel: snapshot.windowLabel,
        apyBps: snapshot.apyBps,
        apyPostFeeBps: snapshot.apyPostFeeBps,
        periodDays: snapshot.periodDays,
        noisy: snapshot.noisy,
        ppsStart: snapshot.ppsStart.toString(),
        ppsEnd: snapshot.ppsEnd.toString(),
        blockStart: snapshot.blockStart.toString(),
        blockEnd: snapshot.blockEnd.toString(),
        computedAt: snapshot.computedAt.toISOString(),
    };
}

function serializeState(state: PoolState): Record<string, unknown> {
    return {
        totalAssets: state.totalAssets.toString(),
        totalSupply: state.totalSupply.toString(),
        freeBalance: state.freeBalance.toString(),
        totalLiabilities: state.totalLiabilities.toString(),
        utilization: state.utilization.toString(),
        protocolFeeBps: state.protocolFeeBps,
        treasuryShareBps: state.treasuryShareBps,
        lpWithdrawalFeeBps: state.lpWithdrawalFeeBps,
        maxBetAmount: state.maxBetAmount.toString(),
        maxLiabilityPerMarketBps: state.maxLiabilityPerMarketBps,
        maxLiabilityPerMatchBps: state.maxLiabilityPerMatchBps,
        depositCooldownSeconds: state.depositCooldownSeconds,
        paused: state.paused,
        accruedTreasury: state.accruedTreasury.toString(),
        treasury: state.treasury,
        pendingTreasury: state.pendingTreasury,
    };
}

@injectable()
export class PoolController {
    constructor(
        @inject(GetLatestApyUseCase)
        private readonly getLatestApyUseCase: GetLatestApyUseCase,
        @inject(GetPoolStateUseCase)
        private readonly getPoolStateUseCase: GetPoolStateUseCase,
        @inject(TOKENS.IClock)
        private readonly clock: IClock,
    ) {}

    async getApy(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.getLatestApyUseCase.execute();
            // 5-minute browser cache — the job recomputes every 15 min, so this
            // is well below the freshness floor.
            res.set('Cache-Control', 'public, max-age=300');
            res.json({
                success: true,
                apy7d: serializeApy(result.apy7d),
                apy30d: serializeApy(result.apy30d),
                timestamp: this.clock.now().getTime(),
            });
        } catch (error) {
            next(error);
        }
    }

    async getState(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const state = await this.getPoolStateUseCase.execute();
            // Browser cache short enough to track in-game pool moves; the
            // server-side cache TTL is 15 s, edges piggy-back on it.
            res.set('Cache-Control', 'public, max-age=15');
            res.json({
                success: true,
                state: serializeState(state),
                timestamp: this.clock.now().getTime(),
            });
        } catch (error) {
            next(error);
        }
    }
}
