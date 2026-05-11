import { WaitlistEntry } from '../entities/WaitlistEntry';

export interface WaitlistStats {
  totalEntries: number;
}

export interface IWaitlistRepository {
  save(entry: WaitlistEntry): Promise<WaitlistEntry>;
  findByEmail(email: string): Promise<WaitlistEntry | null>;
  getStats(): Promise<WaitlistStats>;
}
