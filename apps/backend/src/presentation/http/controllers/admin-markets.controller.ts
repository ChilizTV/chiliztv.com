import { Request, Response, NextFunction } from 'express';
import { container, injectable } from 'tsyringe';

import { ValidationError } from '@chiliztv/domain/shared/errors/ValidationError';

import { DeployMatchContractUseCase } from '../../../application/admin/use-cases/DeployMatchContractUseCase';
import { CloseMatchMarketsUseCase } from '../../../application/admin/use-cases/CloseMatchMarketsUseCase';
import { auditCtx } from './audit-context';

function matchId(req: Request): number {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid match id');
    return id;
}

@injectable()
export class AdminMarketsController {
    async deploy(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await container.resolve(DeployMatchContractUseCase).execute(matchId(req), auditCtx(req));
            res.json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    }

    async closeMarkets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await container.resolve(CloseMatchMarketsUseCase).execute(matchId(req), auditCtx(req));
            res.json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    }
}
