/**
 * Cache-key conventions for user-profile reads. Shared by the readers
 * (`Resolve*UseCase`) and the writer (`UpsertUserProfileUseCase`) so a
 * convention drift can't silently make invalidation a no-op.
 */
export const UserCacheKeys = {
  /** Per-wallet profile. Negative caching is achieved by storing the
   *  `username: null` profile with the same TTL — `UpsertUserProfileUseCase`
   *  DELs the key on signup, so a newly-claimed username appears immediately. */
  profile: (walletLower: string): string => `user:profile:${walletLower}`,
} as const;

export const UserCacheTtl = {
  profileSeconds: 300,
  jitterPct: 10,
} as const;
