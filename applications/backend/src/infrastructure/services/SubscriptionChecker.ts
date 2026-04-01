import { injectable, inject } from 'tsyringe';
import { IStreamWalletRepository } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';
import { ISubscriptionChecker } from '@chiliztv/domain/shared/ports/ISubscriptionChecker';

@injectable()
export class SubscriptionChecker implements ISubscriptionChecker {
  constructor(
    @inject('IStreamWalletRepository')
    private readonly streamWalletRepository: IStreamWalletRepository
  ) {}

  async hasActiveSubscription(walletAddress: string): Promise<boolean> {
    try {
      const subscriptions = await this.streamWalletRepository.findSubscriptionsBySubscriber(
        walletAddress
      );
      return subscriptions.some(subscription => subscription.isActive());
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
}
