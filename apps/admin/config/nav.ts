import type { AdminRole } from '@/lib/roles';

export interface NavEntry {
  readonly label: string;
  readonly href: string;
  /** Minimum scopes that can see the entry — cosmetic, the API re-checks. */
  readonly roles: ReadonlyArray<AdminRole>;
}

export const NAV_ENTRIES: ReadonlyArray<NavEntry> = [
  { label: 'Dashboard', href: '/', roles: ['super_admin', 'admin', 'moderator', 'finance'] },
  // Lot 2+: Moderation, Players, Markets, Finance, Contracts, Analytics, Audit.
];
