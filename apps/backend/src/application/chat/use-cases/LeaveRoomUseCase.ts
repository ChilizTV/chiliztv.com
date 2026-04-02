import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';

@injectable()
export class LeaveRoomUseCase {
  constructor(
    @inject(TOKENS.IChatRepository)
    private readonly chatRepository: IChatRepository
  ) {}

  async execute(matchId: number, userId: string): Promise<void> {
    await this.chatRepository.removeConnectedUser(matchId, userId);
  }
}
