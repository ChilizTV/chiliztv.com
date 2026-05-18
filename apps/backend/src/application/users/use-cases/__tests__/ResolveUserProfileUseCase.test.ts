import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// The fallback module pulls the supabase client at module load. We don't
// touch the network here — every test uses a hand-crafted fake — so stub
// the module out before the use case under test pulls it in.
vi.mock('../../../../infrastructure/persistence/repositories/MultiSourceUserDisplayFallback', () => ({
  MultiSourceUserDisplayFallback: class {},
}));

import { ResolveUserProfileUseCase } from '../ResolveUserProfileUseCase';
import { UpsertUserProfileUseCase } from '../UpsertUserProfileUseCase';
import { InMemoryCache } from '../../../../testing/cache/InMemoryCache';
import { MockClock } from '../../../../testing/clock/MockClock';
import { UserCacheKeys } from '../../UserCacheKeys';
import { UserProfile } from '@chiliztv/domain/users/entities/UserProfile';
import type { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';
import type { MultiSourceUserDisplayFallback } from '../../../../infrastructure/persistence/repositories/MultiSourceUserDisplayFallback';

const WALLET = '0x000000000000000000000000000000000000abcd';
const FIXED_NOW = new Date('2026-05-16T12:00:00.000Z');

function fakeRepo(initial: UserProfile | null = null): IUserProfileRepository {
  let stored = initial;
  return {
    findByWalletAddress: vi.fn(async (addr: string) => (stored && stored.walletAddress === addr.toLowerCase() ? stored : null)),
    findManyByWalletAddresses: vi.fn(async (addrs: ReadonlyArray<string>) => {
      const out = new Map<string, UserProfile>();
      for (const a of addrs) {
        if (stored && stored.walletAddress === a.toLowerCase()) out.set(a.toLowerCase(), stored);
      }
      return out;
    }),
    upsert: vi.fn(async (profile: UserProfile) => {
      stored = profile;
    }),
  };
}

function fakeFallback(username: string | null = null): MultiSourceUserDisplayFallback {
  return {
    lookup: vi.fn(async () => (username ? { username, source: 'chat' as const } : null)),
  } as unknown as MultiSourceUserDisplayFallback;
}

describe('ResolveUserProfileUseCase', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    cache = new InMemoryCache();
  });

  it('caches the resolved profile so a second call avoids the repo + fallback', async () => {
    const profile = UserProfile.create({ walletAddress: WALLET, username: 'alice', avatarUrl: null, updatedAt: FIXED_NOW });
    const repo = fakeRepo(profile);
    const fallback = fakeFallback();
    const uc = new ResolveUserProfileUseCase(repo, fallback, new MockClock(FIXED_NOW), cache);

    const first = await uc.execute(WALLET);
    (repo.findByWalletAddress as ReturnType<typeof vi.fn>).mockClear();
    (fallback.lookup as ReturnType<typeof vi.fn>).mockClear();
    const second = await uc.execute(WALLET);

    expect(first.username).toBe('alice');
    expect(second.username).toBe('alice');
    expect(repo.findByWalletAddress).not.toHaveBeenCalled();
    expect(fallback.lookup).not.toHaveBeenCalled();
  });

  it('caches a username-less profile and returns it without re-running the fallback chain', async () => {
    const repo = fakeRepo(null);
    const fallback = fakeFallback(null);
    const uc = new ResolveUserProfileUseCase(repo, fallback, new MockClock(FIXED_NOW), cache);

    await uc.execute(WALLET);
    (fallback.lookup as ReturnType<typeof vi.fn>).mockClear();
    const second = await uc.execute(WALLET);

    expect(second.username).toBeNull();
    expect(fallback.lookup).not.toHaveBeenCalled();
  });

  it('UpsertUserProfileUseCase deletes the cache entry so a fresh signup appears immediately', async () => {
    const repo = fakeRepo(null);
    const fallback = fakeFallback(null);
    const resolver = new ResolveUserProfileUseCase(repo, fallback, new MockClock(FIXED_NOW), cache);
    const upsert = new UpsertUserProfileUseCase(repo, new MockClock(FIXED_NOW), cache);

    // Pre-fill the cache with the "no username yet" state.
    const empty = await resolver.execute(WALLET);
    expect(empty.username).toBeNull();

    // The user signs in via Dynamic Labs.
    await upsert.execute({ walletAddress: WALLET, username: 'alice', avatarUrl: null });

    expect(cache.deletedKeys).toContain(UserCacheKeys.profile(WALLET));
    const after = await resolver.execute(WALLET);
    expect(after.username).toBe('alice');
  });
});
