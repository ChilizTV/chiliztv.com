export interface DonationResponseDto {
  id: string;
  streamerAddress: string;
  donorAddress: string;
  streamWalletAddress?: string;
  /** Montant en wei, sérialisé depuis bigint. Parser avec BigInt(dto.amount) pour les calculs. */
  amount: string;
  platformFee?: string;
  streamerAmount?: string;
  message?: string;
  transactionHash: string;
  /**
   * ISO 8601 — sérialisé depuis le champ `timestamp` de l'entité domaine.
   * Note: le backend expose ce champ sous le nom `timestamp` (pas `createdAt`).
   */
  timestamp: string;
}

export interface DonationListResponseDto {
  donations: DonationResponseDto[];
  count: number;
}
