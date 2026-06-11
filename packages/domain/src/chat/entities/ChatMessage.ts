export enum MessageType {
  REGULAR = 'REGULAR',
  BET = 'BET',
  SYSTEM = 'SYSTEM',
  DONATION = 'DONATION',
}

export interface ChatMessageProps {
  id: string;
  matchId: number;
  streamId?: string;
  userId: string;
  walletAddress: string;
  username: string;
  message: string;
  timestamp: Date;
  type: MessageType;
  isFeatured: boolean;
  systemType?: string;
  betType?: string;
  betSubType?: string;
  amount?: number;
  odds?: number;
  /** Client-generated UUID for deterministic optimistic dedup. */
  clientTempId?: string;
  /** Soft-delete timestamp set by moderation — content is never physically deleted. */
  removedAt?: Date | null;
}

export class ChatMessage {
  private constructor(private readonly props: ChatMessageProps) {}

  /**
   * Invariant — bet notifications (`type=SYSTEM, systemType='bet'`) must
   * target the per-match general channel only (`streamId` null/undefined).
   */
  static create(props: Omit<ChatMessageProps, 'id' | 'timestamp'>): ChatMessage {
    if (props.systemType === 'bet' && props.streamId != null) {
      throw new Error(
        'ChatMessage invariant: bet notifications must target the general match channel (streamId === null).',
      );
    }
    return new ChatMessage({
      ...props,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    });
  }

  static reconstitute(props: ChatMessageProps): ChatMessage {
    return new ChatMessage(props);
  }

  getId(): string {
    return this.props.id;
  }

  getMatchId(): number {
    return this.props.matchId;
  }

  getStreamId(): string | undefined {
    return this.props.streamId;
  }

  getUserId(): string {
    return this.props.userId;
  }

  isBetMessage(): boolean {
    return this.props.type === MessageType.BET;
  }

  toJSON(): any {
    return {
      id: this.props.id,
      matchId: this.props.matchId,
      streamId: this.props.streamId ?? null,
      userId: this.props.userId,
      walletAddress: this.props.walletAddress,
      username: this.props.username,
      message: this.props.message,
      timestamp: this.props.timestamp.getTime(),
      type: this.props.type,
      isFeatured: this.props.isFeatured,
      ...(this.props.systemType && { systemType: this.props.systemType }),
      ...(this.props.betType && { betType: this.props.betType }),
      ...(this.props.betSubType && { betSubType: this.props.betSubType }),
      ...(this.props.amount && { amount: this.props.amount }),
      ...(this.props.odds && { odds: this.props.odds }),
      ...(this.props.clientTempId && { clientTempId: this.props.clientTempId }),
      ...(this.props.removedAt && { removedAt: this.props.removedAt.toISOString() }),
    };
  }
}
