import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { ConnectedUser } from '@chiliztv/domain/chat/entities/ConnectedUser';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';

@injectable()
export class JoinRoomUseCase {
  constructor(
    @inject(TOKENS.IChatRepository)
    private readonly chatRepository: IChatRepository
  ) {}

  async execute(matchId: number, userId: string, username: string): Promise<ConnectedUser> {
    const user = ConnectedUser.create({
      matchId,
      userId,
      username,
    });

    return await this.chatRepository.addConnectedUser(user);
  }
}
