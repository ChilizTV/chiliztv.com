"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followsApi, FollowDto } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

export function useIsFollowing(followerId: string | undefined, streamerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.follows.isFollowing(followerId ?? '', streamerId ?? ''),
    queryFn: () => followsApi.isFollowing(followerId!, streamerId!),
    enabled: !!followerId && !!streamerId,
    staleTime: 30_000,
    select: (data) => data.isFollowing,
  });
}

export function useFollowerCount(streamerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.follows.count(streamerId ?? ''),
    queryFn: () => followsApi.getFollowerCount(streamerId!),
    enabled: !!streamerId,
    staleTime: 30_000,
    select: (data) => data.count,
  });
}

export function useFollowedStreamers(followerId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.follows.following(followerId ?? ''),
    queryFn: () => followsApi.getFollowedStreamers(followerId!),
    enabled: !!followerId,
    staleTime: 30_000,
    select: (data) => data.follows as FollowDto[],
  });
}

export function useFollowMutation(followerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ streamerId, streamerName }: { streamerId: string; streamerName: string }) =>
      followsApi.follow(followerId!, streamerId, streamerName),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.isFollowing(followerId ?? '', variables.streamerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.count(variables.streamerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.following(followerId ?? '') });
    },
  });
}

export function useUnfollowMutation(followerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ streamerId }: { streamerId: string }) =>
      followsApi.unfollow(followerId!, streamerId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.isFollowing(followerId ?? '', variables.streamerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.count(variables.streamerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.follows.following(followerId ?? '') });
    },
  });
}
