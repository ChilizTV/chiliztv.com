import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IWaitlistRepository, WaitlistStats } from '@chiliztv/domain/waitlist/repositories/IWaitlistRepository';

@injectable()
export class GetWaitlistStatsUseCase {
  constructor(
    @inject(TOKENS.IWaitlistRepository)
    private readonly waitlistRepository: IWaitlistRepository
  ) {}

  async execute(): Promise<WaitlistStats> {
    return await this.waitlistRepository.getStats();
  }
}
