import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { ConnectedUser } from '@chiliztv/domain/chat/entities/ConnectedUser';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';

@injectable()
export class GetConnectedUsersUseCase {
  constructor(
    @inject(TOKENS.IChatRepository)
    private readonly chatRepository: IChatRepository
  ) {}

  async execute(matchId: number): Promise<ConnectedUser[]> {
    return await this.chatRepository.findConnectedUsersByMatchId(matchId);
  }
}
