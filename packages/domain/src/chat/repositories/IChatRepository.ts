import { ChatMessage } from '../entities/ChatMessage';
import { ConnectedUser } from '../entities/ConnectedUser';

export interface ChatStats {
  connectedUsers: number;
  activeRooms: number;
  totalMessages: number;
  featuredMessages: number;
}

export interface IChatRepository {
  saveMessage(message: ChatMessage): Promise<ChatMessage>;
  findMessagesByMatchId(matchId: number, limit: number, offset: number, streamId?: string): Promise<ChatMessage[]>;
  findFeaturedMessages(matchId: number): Promise<ChatMessage[]>;
  findMessageById(messageId: string): Promise<ChatMessage | null>;

  /**
   * Soft-delete (moderation): sets removed_at + the triggering action id.
   * Guarded on `removed_at IS NULL` so re-runs are no-ops. Returns the
   * message's matchId when a row was actually updated, null otherwise.
   */
  softDeleteMessage(messageId: string, actionId: string, at: Date): Promise<{ matchId: number } | null>;

  addConnectedUser(user: ConnectedUser): Promise<ConnectedUser>;
  removeConnectedUser(matchId: number, userId: string): Promise<void>;
  findConnectedUsersByMatchId(matchId: number): Promise<ConnectedUser[]>;
  updateUserActivity(matchId: number, userId: string): Promise<void>;

  getChatStats(): Promise<ChatStats>;
}
