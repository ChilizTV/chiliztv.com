export interface CreateStreamDto {
  matchId: number;
  streamerId: string;
  streamerName: string;
  streamerWalletAddress?: string;
  title?: string;
  /** Publisher path. Defaults to 'obs' server-side when omitted. */
  sourceType?: 'obs' | 'browser';
}
