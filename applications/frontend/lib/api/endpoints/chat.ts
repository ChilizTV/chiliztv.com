import { apiClient } from '../client';

/**
 * @notice Chat message interface
 */
export interface ChatMessage {
  id: string;
  matchId: number;
  userId: string;
  username: string;
  message: string;
  type: string;
  walletAddress: string;
  createdAt: string;
}

/**
 * @notice Connected user interface
 */
export interface ConnectedUser {
  id: string;
  username: string;
  connectedAt: string;
  lastActivity: string;
}

/**
 * @notice Chat statistics interface
 */
export interface ChatStats {
  totalMessages: number;
  totalUsers: number;
  activeRooms: number;
  lastMessageAt: string | null;
}

/**
 * @notice Join room request DTO
 */
export interface JoinRoomDTO {
  userId: string;
  username: string;
}

/**
 * @notice Leave room request DTO
 */
export interface LeaveRoomDTO {
  userId: string;
  username: string;
}

/**
 * @notice Send message request DTO
 */
export interface SendMessageDTO {
  userId: string;
  username: string;
  message: string;
  walletAddress: string;
  isFeatured?: boolean;
}

/**
 * @notice Send bet message request DTO
 */
export interface SendBetMessageDTO {
  userId: string;
  username: string;
  message: string;
  betType: string;
  betSubType: string;
  amount: number;
  odds: number;
  walletAddress: string;
  isFeatured?: boolean;
}

/**
 * @notice Chat API endpoints with type-safe methods
 * @dev These REST endpoints are available but chat primarily uses Supabase real-time
 */
export const chatApi = {
  /**
   * @notice Join a chat room for a match
   * @param matchId Match ID
   * @param data Join room data
   * @return Promise resolving to success response
   */
  joinRoom: (matchId: number, data: JoinRoomDTO): Promise<{ success: boolean; message: string; matchId: number; user: ConnectedUser }> =>
    apiClient.post(`/chat/join/${matchId}`, data),

  /**
   * @notice Leave a chat room for a match
   * @param matchId Match ID
   * @param data Leave room data
   * @return Promise resolving to success response
   */
  leaveRoom: (matchId: number, data: LeaveRoomDTO): Promise<{ success: boolean; message: string; matchId: number }> =>
    apiClient.post(`/chat/leave/${matchId}`, data),

  /**
   * @notice Send a text message to a chat room
   * @param matchId Match ID
   * @param data Message data
   * @return Promise resolving to created message
   */
  sendMessage: (matchId: number, data: SendMessageDTO): Promise<{ success: boolean; message: ChatMessage }> =>
    apiClient.post(`/chat/message/${matchId}`, data),

  /**
   * @notice Send a bet message to a chat room
   * @param matchId Match ID
   * @param data Bet message data
   * @return Promise resolving to created bet message
   */
  sendBetMessage: (matchId: number, data: SendBetMessageDTO): Promise<{ success: boolean; message: ChatMessage }> =>
    apiClient.post(`/chat/bet/${matchId}`, data),

  /**
   * @notice Fetch messages for a chat room
   * @param matchId Match ID
   * @param limit Maximum number of messages to fetch
   * @param offset Number of messages to skip
   * @return Promise resolving to array of messages
   */
  getRoomMessages: (matchId: number, limit: number = 50, offset: number = 0): Promise<{ success: boolean; messages: ChatMessage[]; count: number }> =>
    apiClient.get(`/chat/messages/${matchId}?limit=${limit}&offset=${offset}`),

  /**
   * @notice Fetch connected users in a chat room
   * @param matchId Match ID
   * @return Promise resolving to array of connected users
   */
  getConnectedUsers: (matchId: number): Promise<{ success: boolean; users: ConnectedUser[]; count: number }> =>
    apiClient.get(`/chat/users/${matchId}`),

  /**
   * @notice Fetch global chat statistics
   * @return Promise resolving to chat stats
   */
  getChatStats: (): Promise<{ success: boolean; stats: ChatStats }> =>
    apiClient.get('/chat/stats'),
};
