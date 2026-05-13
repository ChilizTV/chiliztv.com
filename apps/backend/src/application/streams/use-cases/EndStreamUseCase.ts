import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { IStreamingService } from '@chiliztv/domain/streams/ports/IStreamingService';
import { logger } from '../../../infrastructure/logging/logger';

@injectable()
export class EndStreamUseCase {
  constructor(
    @inject(TOKENS.IStreamRepository)
    private readonly streamRepository: IStreamRepository,
    @inject(TOKENS.IStreamingService)
    private readonly streamingService: IStreamingService,
  ) {}

  async execute(params: {
    streamId?: string;
    streamKey?: string;
    cloudflareInputUid?: string;
  }): Promise<void> {
    const stream = params.streamId
      ? await this.streamRepository.findById(params.streamId)
      : params.streamKey
        ? await this.streamRepository.findByStreamKey(params.streamKey)
        : null;

    if (!stream) {
      // No DB row — expected when OBS never connected (key was generated but
      // OBS didn't start streaming). Still clean up the CF live input.
      const uid = params.cloudflareInputUid;
      if (uid) {
        this.streamingService.deleteLiveInput(uid).catch(err =>
          logger.warn('Failed to delete CF live input (no DB row)', { uid, err: err.message }),
        );
      }
      return;
    }

    stream.end();
    await this.streamRepository.update(stream);

    const uid = stream.getCloudflareInputUid() ?? params.cloudflareInputUid;
    if (uid) {
      this.streamingService.deleteLiveInput(uid).catch(err =>
        logger.warn('Failed to delete CF live input', { uid, err: err.message }),
      );
    }
  }
}
