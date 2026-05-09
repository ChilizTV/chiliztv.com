import { ExtendedOdds } from './IFootballApiService';

export interface DeployContractResult {
  contractAddress: string;
}

export interface IBlockchainService {
  deployBettingContract(matchName: string, ownerAddress: string, oracleAddress?: string): Promise<DeployContractResult>;
  setupMarkets(contractAddress: string, odds: ExtendedOdds): Promise<void>;
  resolveMarkets(contractAddress: string, homeScore: number, awayScore: number): Promise<number>;
  syncOdds(contractAddress: string, odds: ExtendedOdds): Promise<void>;
  getAdminAddress(): string;
}
