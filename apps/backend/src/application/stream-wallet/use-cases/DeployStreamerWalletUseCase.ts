import { injectable, inject } from 'tsyringe';
import { isAddress } from 'viem';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { IStreamWalletRepository } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';
import { StreamWalletDeploymentAdapter } from '../../../infrastructure/blockchain/adapters/StreamWalletDeploymentAdapter';
import { logger } from '../../../infrastructure/logging/logger';

export interface DeployStreamerWalletResult {
    /** Final wallet address (existing or freshly deployed). */
    wallet: `0x${string}`;
    /** True when the call performed a fresh deployment. */
    created: boolean;
}

/**
 * Application-level orchestration for self-onboarding a streamer.
 *
 * The frontend sends the connected wallet address; this use case:
 *  1. Validates the address shape.
 *  2. Asks the deployment adapter to ensure a `StreamWallet` exists for it.
 *  3. On a fresh deployment, persists the `(streamer, wallet, txHash)`
 *     mapping into `stream_wallets` *synchronously* so subsequent tips /
 *     subscriptions can resolve the streamer immediately — without
 *     waiting for `StreamWalletIndexer` to catch the on-chain
 *     `StreamWalletCreated` event on its next polling tick. The indexer
 *     remains authoritative; its own insert is idempotent on `txHash`,
 *     so a double-write is a no-op.
 *  4. Returns the final wallet address + whether a deployment happened.
 *
 * Idempotent — calling it twice with the same address re-uses the existing
 * proxy and just reports `created: false`.
 */
@injectable()
export class DeployStreamerWalletUseCase {
    constructor(
        @inject(StreamWalletDeploymentAdapter)
        private readonly deployment: StreamWalletDeploymentAdapter,
        @inject(TOKENS.IStreamWalletRepository)
        private readonly streamWalletRepository: IStreamWalletRepository,
    ) {}

    async execute(streamerAddress: string): Promise<DeployStreamerWalletResult> {
        if (!streamerAddress || !isAddress(streamerAddress)) {
            throw new Error('Invalid streamer address');
        }
        try {
            const result = await this.deployment.ensureWallet(streamerAddress);

            // Stamp the mapping into `stream_wallets` now so a tip arriving
            // before the indexer's next tick doesn't degrade to "unknown
            // wallet". `saveStreamWallet` swallows unique-violation errors
            // (PG code 23505), keeping this idempotent vs. the indexer's
            // own insert when it eventually sees `StreamWalletCreated`.
            if (result.created && result.txHash) {
                await this.streamWalletRepository.saveStreamWallet(
                    streamerAddress,
                    result.wallet,
                    result.txHash,
                );
                logger.info('StreamWallet mapping persisted on deploy', {
                    streamerAddress,
                    wallet: result.wallet,
                });
            }

            return { wallet: result.wallet, created: result.created };
        } catch (err) {
            logger.error('DeployStreamerWalletUseCase failed', {
                streamerAddress,
                error: err instanceof Error ? err.message : String(err),
            });
            throw err;
        }
    }
}
