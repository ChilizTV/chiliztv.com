import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import { IStreamRepository } from '@chiliztv/domain/streams/repositories/IStreamRepository';
import { MatchFetchWindow } from '@chiliztv/domain/matches/value-objects/MatchFetchWindow';
import { Stream } from '@chiliztv/domain/streams/entities/Stream';
import type { IClock } from '@chiliztv/domain/shared/ports/IClock';
import type { ICacheService } from '@chiliztv/domain/shared/ports/ICacheService';
import type { IFootballApiService } from '@chiliztv/domain/shared/ports/IFootballApiService';
import {
  BrowseMatchesResponseDto,
  BrowseLeagueDto,
  BrowseMatchDto,
  MatchScoreBreakdownDto,
  StreamPreviewDto,
} from '@chiliztv/shared/dto/matches/BrowseMatchesDto';
import { MatchCacheKeys, MatchCacheTtl } from '../MatchCacheKeys';

@injectable()
export class GetBrowseMatchesUseCase {
  constructor(
    @inject(TOKENS.IMatchRepository)
    private readonly matchRepository: IMatchRepository,
    @inject(TOKENS.IStreamRepository)
    private readonly streamRepository: IStreamRepository,
    @inject(TOKENS.IClock)
    private readonly clock: IClock,
    @inject(TOKENS.ICacheService)
    private readonly cache: ICacheService,
    @inject(TOKENS.IFootballApiService)
    private readonly footballApi: IFootballApiService,
  ) {}

  async execute(): Promise<BrowseMatchesResponseDto> {
    const cached = await this.cache.getOrLoad<BrowseMatchesResponseDto>({
      key: MatchCacheKeys.listBrowse,
      ttlSeconds: MatchCacheTtl.listSeconds,
      jitterPct: MatchCacheTtl.jitterPct,
      loader: () => this.build(),
    });
    return cached ?? { success: true, leagues: [] };
  }

  private async build(): Promise<BrowseMatchesResponseDto> {
    const now = this.clock.now();
    const matches = await this.matchRepository.findFromDate(
      MatchFetchWindow.displayFrom(now),
    );

    // live_streams.match_id references api_football_id (integer), not the UUID primary key
    const matchIds = matches.map(m => m.toJSON().apiFootballId as number);
    const streams = await this.streamRepository.findActiveByMatchIds(matchIds);

    // Index streams by matchId for O(1) lookup
    const streamsByMatchId = new Map<number, Stream[]>();
    for (const stream of streams) {
      const matchId = stream.toJSON().matchId as number;
      if (!streamsByMatchId.has(matchId)) {
        streamsByMatchId.set(matchId, []);
      }
      streamsByMatchId.get(matchId)!.push(stream);
    }

    // Group matches by leagueId, preserving insertion order
    const leaguesMap = new Map<number, BrowseLeagueDto>();

    for (const match of matches) {
      const props = match.toJSON();
      const leagueId: number = props.league.id;

      if (!leaguesMap.has(leagueId)) {
        leaguesMap.set(leagueId, {
          league: {
            id: leagueId,
            name: props.league.name,
            logoUrl: props.league.logo ?? null,
            country: null,
          },
          matches: [],
        });
      }

      const matchStreams = streamsByMatchId.get(props.apiFootballId as number) ?? [];
      const streamsPreview: StreamPreviewDto[] = matchStreams.slice(0, 4).map(s => {
        const sJson = s.toJSON();
        return {
          streamId: sJson.id,
          streamerName: sJson.streamerName,
          thumbnailUrl: sJson.thumbnailUrl ?? null,
          viewers: sJson.viewerCount,
        };
      });

      // Score breakdown — emitted only for matches that went to AET or PEN
      // (`props.aet*Score` or `props.pen*Score` non-null). Null otherwise to
      // keep the wire shape minimal for the 99% FT matches in the response.
      const ninetyHome = props.score?.home;
      const ninetyAway = props.score?.away;
      const hasAet = props.aetHomeScore != null && props.aetAwayScore != null;
      const hasPen = props.penHomeScore != null && props.penAwayScore != null;
      let scoreBreakdown: MatchScoreBreakdownDto | null = null;
      if (ninetyHome != null && ninetyAway != null && (hasAet || hasPen)) {
        scoreBreakdown = {
          ninety: { home: ninetyHome, away: ninetyAway },
          ...(hasAet && { aet: { home: props.aetHomeScore as number, away: props.aetAwayScore as number } }),
          ...(hasPen && { pen: { home: props.penHomeScore as number, away: props.penAwayScore as number } }),
        };
      }

      // For AET/PEN matches, expose the AET aggregate as the headline `score`
      // — that's what the fmtMatchScore helper expects as the displayed value.
      // Falls back to the 90' score otherwise.
      const headlineScore = props.finalScore as { home: number; away: number } | null | undefined
        ?? (ninetyHome != null && ninetyAway != null ? { home: ninetyHome, away: ninetyAway } : null);

      const browseMatch: BrowseMatchDto = {
        id: props.apiFootballId as number, // integer used in /live/:id URL (getMatchById does parseInt)
        homeTeam: {
          name: props.homeTeam.name,
          logoUrl: props.homeTeam.logo ?? null,
        },
        awayTeam: {
          name: props.awayTeam.name,
          logoUrl: props.awayTeam.logo ?? null,
        },
        kickoffAt: props.matchDate instanceof Date
          ? props.matchDate.toISOString()
          : String(props.matchDate),
        status: props.status,
        score: headlineScore,
        scoreBreakdown,
        isKnockout: props.isKnockout === true,
        homeForm: props.homeForm ?? null,
        awayForm: props.awayForm ?? null,
        elapsed: props.elapsed ?? null,
        contractAddress: props.bettingContractAddress ?? null,
        streamsPreview,
      };

      leaguesMap.get(leagueId)!.matches.push(browseMatch);
    }

    return {
      success: true,
      leagues: Array.from(leaguesMap.values()),
      dataStale: this.footballApi.isDataStale(),
    };
  }
}
