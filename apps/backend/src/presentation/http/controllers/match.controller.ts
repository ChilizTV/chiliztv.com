import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { IFootballApiService } from '@chiliztv/domain/shared/ports/IFootballApiService';
import type { Match } from '@chiliztv/domain/matches/entities/Match';
import { GetAllMatchesUseCase } from '../../../application/matches/use-cases/GetAllMatchesUseCase';
import { GetLiveMatchesUseCase } from '../../../application/matches/use-cases/GetLiveMatchesUseCase';
import { GetUpcomingMatchesUseCase } from '../../../application/matches/use-cases/GetUpcomingMatchesUseCase';
import { GetMatchByIdUseCase } from '../../../application/matches/use-cases/GetMatchByIdUseCase';
import { GetMatchesByLeagueUseCase } from '../../../application/matches/use-cases/GetMatchesByLeagueUseCase';
import { GetMatchStatsUseCase } from '../../../application/matches/use-cases/GetMatchStatsUseCase';
import { GetBrowseMatchesUseCase } from '../../../application/matches/use-cases/GetBrowseMatchesUseCase';
import { GetMarketPoolsUseCase } from '../../../application/matches/use-cases/GetMarketPoolsUseCase';

@injectable()
export class MatchController {
  constructor(
    @inject(GetAllMatchesUseCase)
    private readonly getAllMatchesUseCase: GetAllMatchesUseCase,
    @inject(GetLiveMatchesUseCase)
    private readonly getLiveMatchesUseCase: GetLiveMatchesUseCase,
    @inject(GetUpcomingMatchesUseCase)
    private readonly getUpcomingMatchesUseCase: GetUpcomingMatchesUseCase,
    @inject(GetMatchByIdUseCase)
    private readonly getMatchByIdUseCase: GetMatchByIdUseCase,
    @inject(GetMatchesByLeagueUseCase)
    private readonly getMatchesByLeagueUseCase: GetMatchesByLeagueUseCase,
    @inject(GetMatchStatsUseCase)
    private readonly getMatchStatsUseCase: GetMatchStatsUseCase,
    @inject(GetBrowseMatchesUseCase)
    private readonly getBrowseMatchesUseCase: GetBrowseMatchesUseCase,
    @inject(GetMarketPoolsUseCase)
    private readonly getMarketPoolsUseCase: GetMarketPoolsUseCase,
    @inject(TOKENS.IClock)
    private readonly clock: IClock,
    @inject(TOKENS.IFootballApiService)
    private readonly footballApi: IFootballApiService,
  ) {}

  /**
   * Stamp the upstream degraded-mode flag onto each match payload so the
   * frontend can render a "Stale data" badge when API-Football is unreachable
   * or quota-exhausted. The signal is global (not per-match) so every match in
   * the same response carries the same value — cheap, no extra round-trip.
   */
  private serialize(match: Match, stale: boolean): Record<string, unknown> {
    return { ...match.toJSON(), dataStale: stale };
  }

  async getAllMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matches = await this.getAllMatchesUseCase.execute();
      const stale = this.footballApi.isDataStale();

      res.json({
        success: true,
        matches: matches.map(m => this.serialize(m, stale)),
        count: matches.length,
        timestamp: this.clock.now().getTime(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiveMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matches = await this.getLiveMatchesUseCase.execute();
      const stale = this.footballApi.isDataStale();

      res.json({
        success: true,
        matches: matches.map(m => this.serialize(m, stale)),
        count: matches.length,
        timestamp: this.clock.now().getTime(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matches = await this.getUpcomingMatchesUseCase.execute();
      const stale = this.footballApi.isDataStale();

      res.json({
        success: true,
        matches: matches.map(m => this.serialize(m, stale)),
        count: matches.length,
        timestamp: this.clock.now().getTime(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getMatchById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const match = await this.getMatchByIdUseCase.execute(id);
      const stale = this.footballApi.isDataStale();

      res.json({
        success: true,
        match: this.serialize(match, stale),
      });
    } catch (error) {
      next(error);
    }
  }

  async getMatchesByLeague(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leagueId = parseInt(req.params.league);
      const matches = await this.getMatchesByLeagueUseCase.execute(leagueId);
      const stale = this.footballApi.isDataStale();

      res.json({
        success: true,
        matches: matches.map(m => this.serialize(m, stale)),
        count: matches.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMatchStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.getMatchStatsUseCase.execute();

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBrowseMatches(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getBrowseMatchesUseCase.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMarketPools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = String(req.params.address ?? '').toLowerCase();
      if (!/^0x[0-9a-f]{40}$/.test(address)) {
        res.status(400).json({ success: false, error: { code: 'INVALID_ADDRESS', message: 'Address must be a 0x-prefixed 40-hex string' } });
        return;
      }
      const dto = await this.getMarketPoolsUseCase.execute(address);
      // Short Cache-Control allows a CDN edge cache in front of the API to
      // soak up the read-heavy /pools traffic during a live match.
      res.setHeader('Cache-Control', 'public, max-age=3');
      res.json({ success: true, ...dto });
    } catch (error) {
      next(error);
    }
  }
}
