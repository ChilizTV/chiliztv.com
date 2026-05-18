import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetMatchByIdUseCase } from '../GetMatchByIdUseCase';
import { NotFoundError } from '@chiliztv/domain/shared/errors/NotFoundError';
import { matchFixture, __resetTestMatchIdForTesting } from '../../../../testing/fixtures/match.fixtures';
import { InMemoryCache } from '../../../../testing/cache/InMemoryCache';
import type { IMatchRepository } from '@chiliztv/domain/matches/repositories/IMatchRepository';
import type { Match } from '@chiliztv/domain/matches/entities/Match';

function fakeRepo(impl: (id: number) => Promise<Match | null>): IMatchRepository {
  return {
    findByApiFootballId: vi.fn(impl),
    findAll: vi.fn(),
    findByDateRange: vi.fn(),
    findFromDate: vi.fn(),
    findById: vi.fn(),
    findByBettingContractAddress: vi.fn(),
    findLive: vi.fn(),
    findUpcoming: vi.fn(),
    findByLeagueId: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    getStats: vi.fn(),
    listBettingContractAddresses: vi.fn(),
    deleteFinishedBefore: vi.fn(),
  } as unknown as IMatchRepository;
}

describe('GetMatchByIdUseCase', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    __resetTestMatchIdForTesting();
    cache = new InMemoryCache();
  });

  it('returns a reconstituted Match on cold cache and serves cache on second call', async () => {
    const repo = fakeRepo(async () => matchFixture.firstHalf({ apiFootballId: 4242 }));
    const uc = new GetMatchByIdUseCase(repo, cache);

    const first = await uc.execute(4242);
    (repo.findByApiFootballId as ReturnType<typeof vi.fn>).mockClear();
    const second = await uc.execute(4242);

    expect(first.isLive()).toBe(true);
    expect(second.isLive()).toBe(true);
    expect(repo.findByApiFootballId).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when loader returns null and re-throws on subsequent (cached) misses', async () => {
    const repo = fakeRepo(async () => null);
    const uc = new GetMatchByIdUseCase(repo, cache);

    await expect(uc.execute(9999)).rejects.toBeInstanceOf(NotFoundError);
    const callsAfterFirst = (repo.findByApiFootballId as ReturnType<typeof vi.fn>).mock.calls.length;

    await expect(uc.execute(9999)).rejects.toBeInstanceOf(NotFoundError);

    // Negative cache absorbs the second lookup: same NotFoundError, no extra repo call.
    expect((repo.findByApiFootballId as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterFirst);
  });
});
