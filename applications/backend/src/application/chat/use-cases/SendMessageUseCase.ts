import { injectable, inject } from 'tsyringe';
import { ChatMessage, MessageType } from '@chiliztv/domain/chat/entities/ChatMessage';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import { ISubscriptionChecker } from '@chiliztv/domain/shared/ports/ISubscriptionChecker';
import { SendMessageDto } from '@chiliztv/shared/dto/chat/SendMessageDto';

@injectable()
export class SendMessageUseCase {
  constructor(
    @inject('IChatRepository')
    private readonly chatRepository: IChatRepository,
    @inject('ISubscriptionChecker')
    private readonly subscriptionChecker: ISubscriptionChecker
  ) {}

  async execute(dto: SendMessageDto): Promise<ChatMessage> {
    // Check if user has an active subscription to determine featured status
    const isFeatured = await this.subscriptionChecker.hasActiveSubscription(dto.walletAddress);

    const message = ChatMessage.create({
      matchId: dto.matchId,
      streamId: dto.streamId,
      userId: dto.userId,
      walletAddress: dto.walletAddress,
      username: dto.username,
      message: dto.message,
      type: MessageType.REGULAR,
      isFeatured,
    });

    await this.chatRepository.updateUserActivity(dto.matchId, dto.userId);

    return await this.chatRepository.saveMessage(message);
  }
}
