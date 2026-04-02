import { injectable } from 'tsyringe';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { env } from './environment';

const RPC_URLS: Record<string, string> = {
    mainnet: 'https://rpc.ankr.com/chiliz',
    testnet: 'https://sepolia.base.org',
};

const CHAIN_IDS: Record<string, number> = {
    mainnet: 88888,  // Chiliz mainnet
    testnet: 84532,  // Base Sepolia
};

@injectable()
export class NetworkConfigService implements INetworkConfig {
    readonly rpcUrl: string;
    readonly chainId: number;
    readonly bettingFactoryAddress: string;
    readonly streamWalletFactoryAddress: string;
    readonly adminPrivateKey: string;

    constructor() {
        const network = env.NETWORK ?? 'testnet';
        this.rpcUrl                   = RPC_URLS[network] ?? RPC_URLS.testnet;
        this.chainId                  = CHAIN_IDS[network] ?? CHAIN_IDS.testnet;
        this.bettingFactoryAddress    = env.BETTING_MATCH_FACTORY_ADDRESS;
        this.streamWalletFactoryAddress = env.STREAM_WALLET_FACTORY_ADDRESS;
        this.adminPrivateKey          = env.ADMIN_PRIVATE_KEY;
    }
}
