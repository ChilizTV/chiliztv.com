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
        // Mainnet prefers the _MAINNET variants but falls back to the plain
        // vars — prod secrets historically carry the active-network value in
        // the unsuffixed name. The previous `?? ''` silently handed indexers
        // an empty address when a _MAINNET secret was missing.
        this.pariMatchFactoryAddress    = isMainnet ? (env.PARI_MATCH_FACTORY_ADDRESS_MAINNET ?? env.PARI_MATCH_FACTORY_ADDRESS) : env.PARI_MATCH_FACTORY_ADDRESS;
        this.streamWalletFactoryAddress = isMainnet ? (env.STREAM_WALLET_FACTORY_ADDRESS_MAINNET ?? env.STREAM_WALLET_FACTORY_ADDRESS) : env.STREAM_WALLET_FACTORY_ADDRESS;
        this.swapRouterAddress          = isMainnet ? (env.CHILIZ_SWAP_ROUTER_ADDRESS_MAINNET ?? env.CHILIZ_SWAP_ROUTER_ADDRESS) : env.CHILIZ_SWAP_ROUTER_ADDRESS;
        this.leaderboardRewardsAddress  = isMainnet ? (env.LEADERBOARD_REWARDS_ADDRESS_MAINNET ?? env.LEADERBOARD_REWARDS_ADDRESS) : env.LEADERBOARD_REWARDS_ADDRESS;
        this.usdcAddress                = isMainnet ? (env.USDC_ADDRESS_MAINNET ?? env.USDC_ADDRESS) : env.USDC_ADDRESS;
        this.wchzAddress                = isMainnet ? (env.WCHZ_ADDRESS_MAINNET ?? env.WCHZ_ADDRESS) : env.WCHZ_ADDRESS;
        this.adminPrivateKey            = env.ADMIN_PRIVATE_KEY;
    }
}
