export interface SubscriptionResponseDto {
  id: string;
  streamerAddress: string;
  subscriberAddress: string;
  streamWalletAddress?: string;
  durationSeconds: number;
  /** Montant en wei, sérialisé depuis bigint. Parser avec BigInt(dto.amount) pour les calculs. */
  amount: string;
  platformFee?: string;
  streamerAmount?: string;
  /** ISO 8601 — date de début de la souscription */
  startDate: string;
  /** ISO 8601 — date d'expiration de la souscription */
  endDate: string;
  transactionHash: string;
  status: string;
  isActive: boolean;
}

export interface SubscriptionListResponseDto {
  subscriptions: SubscriptionResponseDto[];
  count: number;
}
