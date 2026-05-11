import { injectable } from 'tsyringe';
import { supabaseClient as supabase } from '../../database/supabase/client';
import { WaitlistEntry } from '@chiliztv/domain/waitlist/entities/WaitlistEntry';
import { IWaitlistRepository, WaitlistStats } from '@chiliztv/domain/waitlist/repositories/IWaitlistRepository';
import { logger } from '../../logging/logger';

interface WaitlistRow {
  id: string;
  email: string;
  wallet_address?: string;
  created_at: string;
}

@injectable()
export class SupabaseWaitlistRepository implements IWaitlistRepository {
  async save(entry: WaitlistEntry): Promise<WaitlistEntry> {
    const json = entry.toJSON();
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        id: json.id,
        email: json.email.toLowerCase(),
        wallet_address: json.walletAddress?.toLowerCase(),
        created_at: json.createdAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to save waitlist entry', { error: error.message });
      throw new Error('Failed to save waitlist entry');
    }

    return this.toDomain(data);
  }

  async findByEmail(email: string): Promise<WaitlistEntry | null> {
    const { data: row, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      logger.error('Failed to find entry by email', { error: error.message });
      throw new Error('Failed to find waitlist entry');
    }

    return row ? this.toDomain(row) : null;
  }

  async getStats(): Promise<WaitlistStats> {
    const { count, error } = await supabase
      .from('waitlist')
      .select('id', { count: 'exact', head: true });

    if (error) {
      logger.error('Failed to get waitlist stats', { error: error.message });
      throw new Error('Failed to get waitlist stats');
    }

    return { totalEntries: count ?? 0 };
  }

  private toDomain(row: WaitlistRow): WaitlistEntry {
    return WaitlistEntry.reconstitute({
      id: row.id,
      email: row.email,
      walletAddress: row.wallet_address,
      createdAt: new Date(row.created_at),
    });
  }
}
