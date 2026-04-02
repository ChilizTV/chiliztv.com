import { MessageType } from '@chiliztv/domain/chat/entities/ChatMessage';

export interface ChatMessageResponseDto {
  id: string;
  matchId: number;
  userId: string;
  username: string;
  walletAddress: string;
  content: string;
  type: MessageType;
  isFeatured: boolean;
  /** ISO 8601 — sérialisé depuis Date */
  createdAt: string;
}

export interface ConnectedUserResponseDto {
  id: string;
  username: string;
  walletAddress: string;
  /** ISO 8601 — sérialisé depuis Date */
  connectedAt: string;
}

export interface ChatStatsResponseDto {
  totalMessages: number;
  totalUsers: number;
  activeRooms: number;
  lastMessageAt: string | null;
}
