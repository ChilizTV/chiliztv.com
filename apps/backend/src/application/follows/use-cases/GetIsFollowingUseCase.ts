import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IFollowRepository } from '@chiliztv/domain/follows/repositories/IFollowRepository';

@injectable()
export class GetIsFollowingUseCase {
  constructor(
    @inject(TOKENS.IFollowRepository)
    private readonly followRepository: IFollowRepository
  ) {}

  async execute(followerId: string, streamerId: string): Promise<boolean> {
    return await this.followRepository.isFollowing(followerId, streamerId);
  }
}
