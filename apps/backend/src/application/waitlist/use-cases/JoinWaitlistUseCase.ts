import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { WaitlistEntry } from '@chiliztv/domain/waitlist/entities/WaitlistEntry';
import { IWaitlistRepository } from '@chiliztv/domain/waitlist/repositories/IWaitlistRepository';
import { JoinWaitlistDto } from '@chiliztv/shared/dto/waitlist/JoinWaitlistDto';
import { ILogger } from '@chiliztv/domain/shared/ports/ILogger';

@injectable()
export class JoinWaitlistUseCase {
  constructor(
    @inject(TOKENS.IWaitlistRepository)
    private readonly waitlistRepository: IWaitlistRepository,
    @inject(TOKENS.ILogger)
    private readonly logger: ILogger
  ) {}

  // Returns { created: true } on first insert, { created: false } on duplicate.
  // Never throws for a duplicate email — callers always respond 200 to avoid
  // leaking whether an email is registered.
  async execute(dto: JoinWaitlistDto): Promise<{ created: boolean }> {
    const existing = await this.waitlistRepository.findByEmail(dto.email);

    if (existing) {
      const incomingWallet = dto.walletAddress?.toLowerCase();
      const storedWallet = existing.getWalletAddress();
      if (incomingWallet && storedWallet && incomingWallet !== storedWallet) {
        this.logger.warn('WAITLIST_WALLET_MISMATCH', { email: dto.email });
      }
      return { created: false };
    }

    const entry = WaitlistEntry.create({
      email: dto.email,
      walletAddress: dto.walletAddress,
    });

    await this.waitlistRepository.save(entry);
    return { created: true };
  }
}
