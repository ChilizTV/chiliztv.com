import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { ChatMessage, MessageType } from '@chiliztv/domain/chat/entities/ChatMessage';
import { IChatRepository } from '@chiliztv/domain/chat/repositories/IChatRepository';
import { ISubscriptionChecker } from '@chiliztv/domain/shared/ports/ISubscriptionChecker';
import { SendBetMessageDto } from '@chiliztv/shared/dto/chat/SendMessageDto';

@injectable()
export class SendBetMessageUseCase {
  constructor(
    @inject(TOKENS.IChatRepository)
    private readonly chatRepository: IChatRepository,
    @inject(TOKENS.ISubscriptionChecker)
    private readonly subscriptionChecker: ISubscriptionChecker
  ) {}

  async execute(dto: SendBetMessageDto): Promise<ChatMessage> {
    // Check if user has an active subscription to determine featured status
    const isFeatured = await this.subscriptionChecker.hasActiveSubscription(dto.walletAddress);

    const message = ChatMessage.create({
      matchId: dto.matchId,
      userId: dto.userId,
      walletAddress: dto.walletAddress,
      username: dto.username,
      message: dto.message,
      type: MessageType.BET,
      isFeatured,
      betType: dto.betType,
      betSubType: dto.betSubType,
      amount: dto.amount,
      odds: dto.odds,
    });

    await this.chatRepository.updateUserActivity(dto.matchId, dto.userId);

    return await this.chatRepository.saveMessage(message);
  }
}
