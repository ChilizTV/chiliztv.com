import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IFollowRepository } from '@chiliztv/domain/follows/repositories/IFollowRepository';

@injectable()
export class UnfollowStreamerUseCase {
  constructor(
    @inject(TOKENS.IFollowRepository)
    private readonly followRepository: IFollowRepository
  ) {}

  async execute(followerId: string, streamerId: string): Promise<void> {
    await this.followRepository.unfollow(followerId, streamerId);
  }
}
