import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { NotFoundError } from '@chiliztv/domain/shared/errors/NotFoundError';

@injectable()
export class UpdateViewerCountUseCase {
  constructor(
    @inject(TOKENS.IStreamRepository)
    private readonly streamRepository: IStreamRepository
  ) {}

  async execute(streamId: string, count: number): Promise<void> {
    const stream = await this.streamRepository.findById(streamId);

    if (!stream) {
      throw new NotFoundError('Stream', streamId);
    }

    stream.updateViewerCount(count);
    await this.streamRepository.update(stream);
  }
}
