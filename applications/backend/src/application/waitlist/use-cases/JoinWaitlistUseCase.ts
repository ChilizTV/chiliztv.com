import { injectable, inject } from 'tsyringe';
import { WaitlistEntry } from '@chiliztv/domain/waitlist/entities/WaitlistEntry';
import { IWaitlistRepository } from '@chiliztv/domain/waitlist/repositories/IWaitlistRepository';
import { JoinWaitlistDto } from '@chiliztv/shared/dto/waitlist/JoinWaitlistDto';
import { ConflictError } from '@chiliztv/domain/shared/errors/ConflictError';

@injectable()
export class JoinWaitlistUseCase {
  constructor(
    @inject('IWaitlistRepository')
    private readonly waitlistRepository: IWaitlistRepository
  ) {}

  async execute(dto: JoinWaitlistDto): Promise<WaitlistEntry> {
    const existing = await this.waitlistRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('Email already in waitlist');
    }

    const entry = WaitlistEntry.create({
      email: dto.email,
      walletAddress: dto.walletAddress,
      source: dto.source,
      hasAccess: false,
    });

    return await this.waitlistRepository.save(entry);
  }
}
