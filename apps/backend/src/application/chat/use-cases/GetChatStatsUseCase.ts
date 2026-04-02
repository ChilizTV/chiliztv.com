import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IChatRepository, ChatStats } from '@chiliztv/domain/chat/repositories/IChatRepository';

@injectable()
export class GetChatStatsUseCase {
  constructor(
    @inject(TOKENS.IChatRepository)
    private readonly chatRepository: IChatRepository
  ) {}

  async execute(): Promise<ChatStats> {
    return await this.chatRepository.getChatStats();
  }
}
