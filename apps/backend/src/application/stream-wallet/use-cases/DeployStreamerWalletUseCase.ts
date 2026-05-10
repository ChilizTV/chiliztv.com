import { injectable, inject } from 'tsyringe';
import { isAddress } from 'viem';
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
 *  3. Returns the final wallet address + whether a deployment happened.
 *
 * Idempotent — calling it twice with the same address re-uses the existing
 * proxy and just reports `created: false`.
 */
@injectable()
export class DeployStreamerWalletUseCase {
    constructor(
        @inject(StreamWalletDeploymentAdapter)
        private readonly deployment: StreamWalletDeploymentAdapter,
    ) {}

    async execute(streamerAddress: string): Promise<DeployStreamerWalletResult> {
        if (!streamerAddress || !isAddress(streamerAddress)) {
            throw new Error('Invalid streamer address');
        }
        try {
            const result = await this.deployment.ensureWallet(streamerAddress);
            return result;
        } catch (err) {
            logger.error('DeployStreamerWalletUseCase failed', {
                streamerAddress,
                error: err instanceof Error ? err.message : String(err),
            });
            throw err;
        }
    }
}
