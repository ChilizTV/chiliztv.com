import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { Stream, StreamStatus } from '@chiliztv/domain/streams/entities/Stream';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { IStreamingService, StreamMeta } from '@chiliztv/domain/streams/ports/IStreamingService';
import { CreateStreamDto } from '@chiliztv/shared/dto/streams/CreateStreamDto';

@injectable()
export class CreateStreamUseCase {
  constructor(
    @inject(TOKENS.IStreamRepository)
    private readonly streamRepository: IStreamRepository,
    @inject(TOKENS.IStreamingService)
    private readonly streamingService: IStreamingService,
  ) {}

  async execute(dto: CreateStreamDto): Promise<Stream> {
    const sourceType = dto.sourceType ?? 'obs';
    const streamId = crypto.randomUUID();

    const streamMeta: StreamMeta = {
      streamId,
      streamerId: dto.streamerId,
      streamerName: dto.streamerName,
      matchId: dto.matchId,
      streamerWalletAddress: dto.streamerWalletAddress,
      sourceType,
      title: dto.title,
    };

    const liveInput = await this.streamingService.createLiveInput({
      name: `${dto.streamerName} — match ${dto.matchId}`,
      matchId: dto.matchId,
      streamerWallet: dto.streamerWalletAddress,
      streamMeta,
    });

    const streamProps = {
      id: streamId,
      matchId: dto.matchId,
      streamerId: dto.streamerId,
      streamerName: dto.streamerName,
      streamerWalletAddress: dto.streamerWalletAddress,
      streamKey: liveInput.rtmpsStreamKey,
      title: dto.title,
      status: StreamStatus.CREATED,
      sourceType,
      viewerCount: 0,
      cloudflareInputUid: liveInput.uid,
      cloudflareRtmpsUrl: liveInput.rtmpsUrl,
      cloudflareRtmpsStreamKey: liveInput.rtmpsStreamKey,
      cloudflarePlaybackHlsUrl: liveInput.playbackHlsUrl,
      cloudflareWebRtcPublishUrl: liveInput.webRtcPublishUrl,
      hlsUrl: liveInput.playbackHlsUrl,
      createdAt: new Date(),
    };

    if (sourceType === 'browser') {
      // Browser streams are saved directly as LIVE — the publisher is the page
      // itself and WHIP is established in the same request flow. heartbeat() is
      // required so the stale cleanup job has a baseline timestamp to compare.
      const stream = Stream.reconstitute({ ...streamProps, status: StreamStatus.LIVE });
      stream.heartbeat();
      return await this.streamRepository.save(stream);
    }

    // OBS streams: return a virtual entity without a DB row.
    // The DB row is created (directly as LIVE) by StreamLifecycleService
    // when the CF webhook fires on OBS connect. The pre-generated `streamId`
    // is embedded in the CF live input meta so it is used as the DB row id.
    return Stream.reconstitute(streamProps);
  }
}
