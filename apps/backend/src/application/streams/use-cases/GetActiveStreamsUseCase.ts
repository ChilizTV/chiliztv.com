import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Stream } from '@chiliztv/domain/streams/entities/Stream';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';

@injectable()
export class GetActiveStreamsUseCase {
  constructor(
    @inject(TOKENS.IStreamRepository)
    private readonly streamRepository: IStreamRepository
  ) {}

  async execute(matchId?: number, streamerId?: string): Promise<Stream[]> {
    if (matchId) {
      return this.streamRepository.findActiveByMatchIds([matchId]);
    }
    if (streamerId) {
      // OBSSetupPanel polls this to detect when a LIVE stream appears for the streamer.
      const stream = await this.streamRepository.findByStreamerId(streamerId);
      return stream ? [stream] : [];
    }
    return this.streamRepository.findActiveStreams();
  }
}
