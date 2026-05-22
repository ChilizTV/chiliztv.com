import { injectable } from 'tsyringe';
import { INetworkConfig } from '@chiliztv/domain/shared/ports/INetworkConfig';
import { chilizSpicy, chilizMainnet } from '@chiliztv/blockchain';
import { env } from './environment';

@injectable()
export class NetworkConfigService implements INetworkConfig {
    readonly rpcUrl: string;
    readonly chainId: number;
    readonly pariMatchFactoryAddress: string;
    readonly streamWalletFactoryAddress: string;
    readonly swapRouterAddress: string;
    readonly leaderboardRewardsAddress: string;
    readonly usdcAddress: string;
    readonly wchzAddress: string;
    readonly adminPrivateKey: string;

    constructor() {
        const isMainnet = env.NETWORK === 'mainnet';
        const chain = isMainnet ? chilizMainnet : chilizSpicy;
        this.rpcUrl = env.CHILIZ_RPC_URL ?? chain.rpcUrls.default.http[0];
        this.chainId = chain.id;
        this.pariMatchFactoryAddress    = isMainnet ? (env.PARI_MATCH_FACTORY_ADDRESS_MAINNET ?? '') : env.PARI_MATCH_FACTORY_ADDRESS;
        this.streamWalletFactoryAddress = isMainnet ? (env.STREAM_WALLET_FACTORY_ADDRESS_MAINNET ?? '') : env.STREAM_WALLET_FACTORY_ADDRESS;
        this.swapRouterAddress          = isMainnet ? (env.CHILIZ_SWAP_ROUTER_ADDRESS_MAINNET ?? '') : env.CHILIZ_SWAP_ROUTER_ADDRESS;
        this.leaderboardRewardsAddress  = isMainnet ? (env.LEADERBOARD_REWARDS_ADDRESS_MAINNET ?? '') : env.LEADERBOARD_REWARDS_ADDRESS;
        this.usdcAddress                = isMainnet ? (env.USDC_ADDRESS_MAINNET ?? '') : env.USDC_ADDRESS;
        this.wchzAddress                = isMainnet ? (env.WCHZ_ADDRESS_MAINNET ?? '') : env.WCHZ_ADDRESS;
        this.adminPrivateKey            = env.ADMIN_PRIVATE_KEY;
    }
}
