export interface INetworkConfig {
  readonly rpcUrl: string;
  readonly chainId: number;
  readonly bettingFactoryAddress: string;
  readonly streamWalletFactoryAddress: string;
  readonly adminPrivateKey: string;
}
