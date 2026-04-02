import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IFollowRepository } from '@chiliztv/domain/follows/repositories/IFollowRepository';

@injectable()
export class GetFollowerCountUseCase {
  constructor(
    @inject(TOKENS.IFollowRepository)
    private readonly followRepository: IFollowRepository
  ) {}

  async execute(streamerId: string): Promise<number> {
    return await this.followRepository.getFollowerCount(streamerId);
  }
}
