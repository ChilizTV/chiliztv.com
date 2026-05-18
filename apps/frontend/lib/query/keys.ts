/**
 * @notice Query key factory for React Query cache management
 * @dev Provides type-safe, hierarchical query keys for all API resources
 */
export const queryKeys = {
  browse: {
    all: ['browse'] as const,
  },
  matches: {
    all: ['matches'] as const,
    lists: () => [...queryKeys.matches.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.matches.lists(), filters] as const,
    details: () => [...queryKeys.matches.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.matches.details(), id] as const,
    live: () => [...queryKeys.matches.all, 'live'] as const,
    upcoming: () => [...queryKeys.matches.all, 'upcoming'] as const,
    byLeague: (league: string) => [...queryKeys.matches.all, 'league', league] as const,
    stats: () => [...queryKeys.matches.all, 'stats'] as const,
  },
  predictions: {
    all: ['predictions'] as const,
    lists: () => [...queryKeys.predictions.all, 'list'] as const,
    byUser: (userId: string) => [...queryKeys.predictions.lists(), userId] as const,
    stats: (userId: string) => [...queryKeys.predictions.all, 'stats', userId] as const,
  },
  chat: {
    all: ['chat'] as const,
    messages: (matchId: number, limit?: number, offset?: number) => [...queryKeys.chat.all, 'messages', matchId, limit, offset] as const,
    users: (matchId: number) => [...queryKeys.chat.all, 'users', matchId] as const,
    stats: () => [...queryKeys.chat.all, 'stats'] as const,
  },
  streamWallet: {
    all: ['streamWallet'] as const,
    donations: (streamerAddress: string) => [...queryKeys.streamWallet.all, 'donations', streamerAddress] as const,
    subscriptions: (streamerAddress: string) => [...queryKeys.streamWallet.all, 'subscriptions', streamerAddress] as const,
    stats: (streamerAddress: string) => [...queryKeys.streamWallet.all, 'stats', streamerAddress] as const,
    donorDonations: (donorAddress: string) => [...queryKeys.streamWallet.all, 'donor', donorAddress, 'donations'] as const,
    subscriberSubscriptions: (subscriberAddress: string) => [...queryKeys.streamWallet.all, 'subscriber', subscriberAddress, 'subscriptions'] as const,
  },
  waitlist: {
    all: ['waitlist'] as const,
  },
  access: {
    all: ['access'] as const,
    granted: () => [...queryKeys.access.all, 'granted'] as const,
  },
  fanTokens: {
    all: ['fanTokens'] as const,
    balances: (walletAddress: string) => [...queryKeys.fanTokens.all, 'balances', walletAddress] as const,
  },
  follows: {
    all: ['follows'] as const,
    isFollowing: (followerId: string, streamerId: string) => [...queryKeys.follows.all, 'isFollowing', followerId, streamerId] as const,
    count: (streamerId: string) => [...queryKeys.follows.all, 'count', streamerId] as const,
    following: (followerId: string) => [...queryKeys.follows.all, 'following', followerId] as const,
  },
  pool: {
    all: ['pool'] as const,
    state: () => [...queryKeys.pool.all, 'state'] as const,
    apy: () => [...queryKeys.pool.all, 'apy'] as const,
  },
} as const;
