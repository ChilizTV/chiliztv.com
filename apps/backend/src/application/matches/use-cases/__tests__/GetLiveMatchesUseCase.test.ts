import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetLiveMatchesUseCase } from '../GetLiveMatchesUseCase';
import { NoopCacheService } from '../../../../infrastructure/cache/NoopCacheService';
import { matchFixture, __resetTestMatchIdForTesting } from '../../../../testing/fixtures/match.fixtures';
import { InMemoryCache } from '../../../../testing/cache/InMemoryCache';
import type { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { Match } from '@chiliztv/domain/matches/entities/Match';

function fakeRepo(impl: () => Promise<Match[]>): IMatchRepository {
  return {
    findAll: vi.fn(),
    findByDateRange: vi.fn(),
    findFromDate: vi.fn(),
    findById: vi.fn(),
    findByApiFootballId: vi.fn(),
    findByBettingContractAddress: vi.fn(),
    findLive: vi.fn(impl),
    findUpcoming: vi.fn(),
    findByLeagueId: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    getStats: vi.fn(),
    listBettingContractAddresses: vi.fn(),
    deleteFinishedBefore: vi.fn(),
  } as unknown as IMatchRepository;
}

describe('GetLiveMatchesUseCase', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    __resetTestMatchIdForTesting();
    cache = new InMemoryCache();
  });

  it('reconstitutes Match instances from cached props on warm path', async () => {
    const repo = fakeRepo(async () => [matchFixture.firstHalf({ apiFootballId: 4242 })]);
    const uc = new GetLiveMatchesUseCase(repo, cache);

    const first = await uc.execute();
    (repo.findLive as ReturnType<typeof vi.fn>).mockClear();
    const second = await uc.execute();

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    // Reconstituted Match must expose the original methods after cache round-trip.
    expect(typeof second[0]!.isLive).toBe('function');
    expect(second[0]!.isLive()).toBe(true);
    expect(repo.findLive).not.toHaveBeenCalled();
  });

  it('falls through to the repo when bound to NoopCacheService', async () => {
    const repo = fakeRepo(async () => [matchFixture.secondHalf()]);
    const uc = new GetLiveMatchesUseCase(repo, new NoopCacheService());

    await uc.execute();
    await uc.execute();

    expect(repo.findLive).toHaveBeenCalledTimes(2);
  });
});
