import { injectable } from 'tsyringe';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount, nonceManager } from 'viem/accounts';
import { chilizConfig, networkType } from '../../config/chiliz.config';
import { STREAM_WALLET_FACTORY_ABI, chainFor } from '@chiliztv/blockchain';
import { logger } from '../../logging/logger';

if (!process.env.STREAM_WALLET_FACTORY_ADDRESS) {
    throw new Error('STREAM_WALLET_FACTORY_ADDRESS env var is required');
}
const FACTORY_ADDRESS = process.env.STREAM_WALLET_FACTORY_ADDRESS as `0x${string}`;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}`;

/**
 * Streamer-wallet deployment adapter.
 *
 * `StreamWalletFactory.deployWalletFor` is `onlyOwner`, so the deployment
 * must be signed by the admin key. Mirrors `BettingContractDeploymentAdapter`
 * — same admin private key, same chain wiring.
 *
 * Self-onboarding flow: a regular user signs an authenticated HTTP request,
 * the backend verifies they are who they claim to be, then this adapter
 * deploys their `StreamWallet` proxy via the admin signer. Admin pays gas;
 * user pays nothing.
 */
@injectable()
export class StreamWalletDeploymentAdapter {
    private walletClient: ReturnType<typeof createWalletClient>;
    private publicClient: ReturnType<typeof createPublicClient>;

    constructor() {
        if (!ADMIN_PRIVATE_KEY) {
            throw new Error('ADMIN_PRIVATE_KEY env var is required');
        }

        const chain = chainFor(networkType);
        const account = privateKeyToAccount(ADMIN_PRIVATE_KEY, { nonceManager });
        this.walletClient = createWalletClient({
            account,
            chain,
            transport: http(chilizConfig.rpcUrl),
        });
        this.publicClient = createPublicClient({
            chain,
            transport: http(chilizConfig.rpcUrl),
        });

        logger.info('StreamWalletDeploymentAdapter initialized', {
            network: networkType,
            chain: chain.name,
            factoryAddress: FACTORY_ADDRESS,
            adminAddress: account.address,
        });
    }

    /**
     * Read the streamer's existing wallet address (zero if not deployed).
     */
    async getWallet(streamer: string): Promise<`0x${string}`> {
        const result = (await this.publicClient.readContract({
            address: FACTORY_ADDRESS,
            abi: STREAM_WALLET_FACTORY_ABI,
            functionName: 'getWallet',
            args: [streamer as `0x${string}`],
        })) as `0x${string}`;
        return result;
    }

    /**
     * Returns the existing wallet address if one is already deployed,
     * otherwise deploys a new proxy via `factory.deployWalletFor` and
     * returns the freshly created address.
     *
     * When `created === true`, the caller should persist the
     * `(streamer, wallet, txHash)` mapping into `stream_wallets`
     * synchronously — the `StreamWalletIndexer` will eventually pick up
     * the on-chain `StreamWalletCreated` event and idempotently re-insert,
     * but writing the row at deploy time avoids a race where a tip /
     * subscription arrives before the next indexer tick and the wallet
     * lookup returns null.
     */
    async ensureWallet(streamer: string): Promise<{
        wallet: `0x${string}`;
        created: boolean;
        txHash?: `0x${string}`;
    }> {
        const existing = await this.getWallet(streamer);
        if (existing && existing !== '0x0000000000000000000000000000000000000000') {
            return { wallet: existing, created: false };
        }

        logger.info('Deploying StreamWallet proxy', { streamer });

        const hash = await this.walletClient.writeContract({
            account: this.walletClient.account!,
            chain: this.walletClient.chain,
            address: FACTORY_ADDRESS,
            abi: STREAM_WALLET_FACTORY_ABI,
            functionName: 'deployWalletFor',
            args: [streamer as `0x${string}`],
        });

        const receipt = await this.publicClient.waitForTransactionReceipt({
            hash,
            timeout: 120_000,
        });
        if (receipt.status === 'reverted') {
            throw new Error(`Stream wallet deployment reverted (tx: ${hash})`);
        }

        const wallet = await this.getWallet(streamer);
        logger.info('StreamWallet proxy deployed', {
            streamer,
            wallet,
            txHash: hash,
        });
        return { wallet, created: true, txHash: hash };
    }
}
