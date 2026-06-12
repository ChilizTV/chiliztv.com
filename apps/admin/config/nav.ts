import type { AdminRole } from '@/lib/roles';
import type { IconName } from '@/components/common/Icon';

export interface NavEntry {
  readonly label: string;
  readonly href: string;
  readonly icon: IconName;
  /** Minimum scopes that can see the entry — cosmetic, the API re-checks. */
  readonly roles: ReadonlyArray<AdminRole>;
  /** Badge the open-reports count from the overview on this entry. */
  readonly badge?: 'openReports';
}

export const NAV_ENTRIES: ReadonlyArray<NavEntry> = [
  { label: 'Dashboard', href: '/', icon: 'dashboard', roles: ['super_admin', 'admin', 'moderator', 'finance'] },
  { label: 'Moderation', href: '/moderation', icon: 'flag', roles: ['moderator'], badge: 'openReports' },
  { label: 'Players', href: '/players', icon: 'users', roles: ['moderator'] },
  { label: 'Markets', href: '/markets', icon: 'chart', roles: ['admin'] },
];

export const NAV_SOON: ReadonlyArray<{ label: string; icon: IconName }> = [
  { label: 'Finance', icon: 'wallet' },
  { label: 'Analytics', icon: 'pie' },
  { label: 'Audit', icon: 'file' },
];
