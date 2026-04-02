import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Stream, StreamStatus } from '@chiliztv/domain/streams/entities/Stream';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { CreateStreamDto } from '@chiliztv/shared/dto/streams/CreateStreamDto';

@injectable()
export class CreateStreamUseCase {
  constructor(
    @inject(TOKENS.IStreamRepository)
    private readonly streamRepository: IStreamRepository
  ) {}

  async execute(dto: CreateStreamDto): Promise<Stream> {
    const streamKey = crypto.randomUUID(); // full UUID — 36 chars, passes auth format validation

    const stream = Stream.create({
      matchId: dto.matchId,
      streamerId: dto.streamerId,
      streamerName: dto.streamerName,
      streamerWalletAddress: dto.streamerWalletAddress,
      streamKey,
      hlsUrl: `/live/${streamKey}/index.m3u8`,
      title: dto.title,
      status: StreamStatus.CREATED,
      viewerCount: 0,
    });

    return await this.streamRepository.save(stream);
  }
}
