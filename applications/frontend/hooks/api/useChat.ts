import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  chatApi,
  JoinRoomDTO,
  LeaveRoomDTO,
  SendMessageDTO,
  SendBetMessageDTO
} from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

/**
 * @notice Hook to fetch chat messages for a room
 * @param matchId Match ID
 * @param limit Maximum number of messages
 * @param offset Offset for pagination
 * @return Query result with chat messages
 */
export function useChatMessages(matchId: number, limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: queryKeys.chat.messages(matchId, limit, offset),
    queryFn: () => chatApi.getRoomMessages(matchId, limit, offset),
    enabled: !!matchId,
  });
}

/**
 * @notice Hook to fetch connected users in a chat room
 * @param matchId Match ID
 * @return Query result with connected users
 */
export function useConnectedUsers(matchId: number) {
  return useQuery({
    queryKey: queryKeys.chat.users(matchId),
    queryFn: () => chatApi.getConnectedUsers(matchId),
    enabled: !!matchId,
  });
}

/**
 * @notice Hook to fetch global chat statistics
 * @return Query result with chat stats
 */
export function useChatStats() {
  return useQuery({
    queryKey: queryKeys.chat.stats(),
    queryFn: chatApi.getChatStats,
  });
}

/**
 * @notice Hook to join a chat room
 * @return Mutation hook for joining room
 * @dev Invalidates connected users on success
 */
export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: JoinRoomDTO }) =>
      chatApi.joinRoom(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.users(variables.matchId),
      });
    },
  });
}

/**
 * @notice Hook to leave a chat room
 * @return Mutation hook for leaving room
 * @dev Invalidates connected users on success
 */
export function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: LeaveRoomDTO }) =>
      chatApi.leaveRoom(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.users(variables.matchId),
      });
    },
  });
}

/**
 * @notice Hook to send a text message
 * @return Mutation hook for sending message
 * @dev Invalidates chat messages on success
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: SendMessageDTO }) =>
      chatApi.sendMessage(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.all,
      });
    },
  });
}

/**
 * @notice Hook to send a bet message
 * @return Mutation hook for sending bet message
 * @dev Invalidates chat messages on success
 */
export function useSendBetMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: number; data: SendBetMessageDTO }) =>
      chatApi.sendBetMessage(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.all,
      });
    },
  });
}
