import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { Donation } from '@chiliztv/domain/stream-wallet/entities/Donation';
import { Subscription } from '@chiliztv/domain/stream-wallet/entities/Subscription';
import { IStreamWalletRepository, StreamerStats } from '@chiliztv/domain/stream-wallet/repositories/IStreamWalletRepository';
import { logger } from '../../logging/logger';

interface DonationRow {
  id: string;
  streamer_address: string;
  donor_address: string;
  stream_wallet_address?: string;
  amount: string;
  platform_fee?: string;
  streamer_amount?: string;
  message?: string;
  transaction_hash: string;
  created_at: string;
}

interface SubscriptionRow {
  id: string;
  streamer_address: string;
  subscriber_address: string;
  stream_wallet_address?: string;
  duration_seconds: number;
  amount: string;
  platform_fee?: string;
  streamer_amount?: string;
  start_time: string;
  expiry_time: string;
  transaction_hash: string;
  status?: string;
}

@injectable()
export class SupabaseStreamWalletRepository implements IStreamWalletRepository {
  async findDonationsByStreamer(streamerAddress: string): Promise<Donation[]> {
    const { data: rows, error } = await supabase
      .from('donations')
      .select('*')
      .eq('streamer_address', streamerAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to find donations by streamer', { error: error.message, streamerAddress });
      throw new Error('Failed to find donations');
    }

    return rows ? rows.map(row => this.donationToDomain(row)) : [];
  }

  async findDonationsByDonor(donorAddress: string): Promise<Donation[]> {
    const { data: rows, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_address', donorAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to find donations by donor', { error: error.message, donorAddress });
      throw new Error('Failed to find donations');
    }

    return rows ? rows.map(row => this.donationToDomain(row)) : [];
  }

  async findSubscriptionsByStreamer(streamerAddress: string): Promise<Subscription[]> {
    const { data: rows, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('streamer_address', streamerAddress.toLowerCase())
      .order('start_time', { ascending: false });

    if (error) {
      logger.error('Failed to find subscriptions by streamer', { error: error.message, streamerAddress });
      throw new Error('Failed to find subscriptions');
    }

    return rows ? rows.map(row => this.subscriptionToDomain(row)) : [];
  }

  async findSubscriptionsBySubscriber(subscriberAddress: string): Promise<Subscription[]> {
    const { data: rows, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscriber_address', subscriberAddress.toLowerCase())
      .order('start_time', { ascending: false });

    if (error) {
      logger.error('Failed to find subscriptions by subscriber', { error: error.message, subscriberAddress });
      throw new Error('Failed to find subscriptions');
    }

    return rows ? rows.map(row => this.subscriptionToDomain(row)) : [];
  }

  async getStreamerStats(streamerAddress: string): Promise<StreamerStats> {
    const [donations, subscriptions] = await Promise.all([
      this.findDonationsByStreamer(streamerAddress),
      this.findSubscriptionsByStreamer(streamerAddress),
    ]);

    const totalDonations = donations.length;
    const totalDonationAmount = donations.reduce((sum, d) => {
      return sum + parseFloat(d.toJSON().amount);
    }, 0).toString();

    const totalSubscribers = subscriptions.length;
    const activeSubscribers = subscriptions.filter(s => s.isActive()).length;

    return {
      totalDonations,
      totalDonationAmount,
      totalSubscribers,
      activeSubscribers,
    };
  }

  async saveDonation(donation: Donation): Promise<void> {
    const json = donation.toJSON();
    const { error } = await supabase.from('donations').insert({
      id: json.id,
      streamer_address: json.streamerAddress.toLowerCase(),
      donor_address: json.donorAddress.toLowerCase(),
      stream_wallet_address: json.streamWalletAddress?.toLowerCase() ?? '',
      amount: json.amount,
      platform_fee: json.platformFee ?? null,
      streamer_amount: json.streamerAmount ?? null,
      message: json.message ?? null,
      transaction_hash: json.transactionHash,
      created_at: json.timestamp.toISOString(),
    });
    if (error && error.code !== '23505') {
      logger.error('Failed to save donation', { error: error.message });
      throw new Error('Failed to save donation');
    }
  }

  async findDonationByTransactionHash(txHash: string): Promise<boolean> {
    const { data } = await supabase
      .from('donations')
      .select('id')
      .eq('transaction_hash', txHash)
      .maybeSingle();
    return data !== null;
  }

  async saveSubscription(subscription: Subscription): Promise<void> {
    const json = subscription.toJSON();
    const { error } = await supabase.from('subscriptions').insert({
      id: json.id,
      streamer_address: json.streamerAddress.toLowerCase(),
      subscriber_address: json.subscriberAddress.toLowerCase(),
      stream_wallet_address: json.streamWalletAddress?.toLowerCase() ?? '',
      amount: json.amount,
      platform_fee: json.platformFee ?? null,
      streamer_amount: json.streamerAmount ?? null,
      duration_seconds: json.durationSeconds,
      start_time: json.startDate.toISOString(),
      expiry_time: json.endDate.toISOString(),
      transaction_hash: json.transactionHash,
      status: json.status ?? 'active',
      created_at: json.startDate.toISOString(),
    });
    if (error && error.code !== '23505') {
      logger.error('Failed to save subscription', { error: error.message });
      throw new Error('Failed to save subscription');
    }
  }

  async findSubscriptionByTransactionHash(txHash: string): Promise<boolean> {
    const { data } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('transaction_hash', txHash)
      .maybeSingle();
    return data !== null;
  }

  async saveStreamWallet(streamerAddress: string, walletAddress: string, transactionHash: string): Promise<void> {
    const { error } = await supabase.from('stream_wallets').insert({
      streamer_address: streamerAddress.toLowerCase(),
      wallet_address: walletAddress.toLowerCase(),
      transaction_hash: transactionHash,
    });
    if (error && error.code !== '23505') {
      logger.error('Failed to save stream wallet', { error: error.message });
      throw new Error('Failed to save stream wallet');
    }
  }

  async findStreamWalletByTransactionHash(txHash: string): Promise<boolean> {
    const { data } = await supabase
      .from('stream_wallets')
      .select('id')
      .eq('transaction_hash', txHash)
      .maybeSingle();
    return data !== null;
  }

  async markExpiredSubscriptions(): Promise<number> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expiry_time', now)
      .select('id');
    if (error) {
      logger.error('Failed to mark expired subscriptions', { error: error.message });
      throw new Error('Failed to mark expired subscriptions');
    }
    return data?.length ?? 0;
  }

  private donationToDomain(row: DonationRow): Donation {
    return Donation.reconstitute({
      id: row.id,
      streamerAddress: row.streamer_address,
      donorAddress: row.donor_address,
      streamWalletAddress: row.stream_wallet_address,
      amount: row.amount,
      platformFee: row.platform_fee,
      streamerAmount: row.streamer_amount,
      message: row.message,
      transactionHash: row.transaction_hash,
      timestamp: new Date(row.created_at),
    });
  }

  private subscriptionToDomain(row: SubscriptionRow): Subscription {
    return Subscription.reconstitute({
      id: row.id,
      streamerAddress: row.streamer_address,
      subscriberAddress: row.subscriber_address,
      streamWalletAddress: row.stream_wallet_address,
      durationSeconds: row.duration_seconds,
      amount: row.amount,
      platformFee: row.platform_fee,
      streamerAmount: row.streamer_amount,
      startDate: new Date(row.start_time),
      endDate: new Date(row.expiry_time),
      transactionHash: row.transaction_hash,
      status: row.status as 'active' | 'expired' | undefined,
    });
  }
}
