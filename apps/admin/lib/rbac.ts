import type { AdminRole } from './roles';

// Mirror of the backend AdminRolePolicy — display filtering only.
const SATISFIES: Readonly<Record<AdminRole, ReadonlyArray<AdminRole>>> = {
  super_admin: ['super_admin'],
  admin: ['super_admin', 'admin'],
  moderator: ['super_admin', 'admin', 'moderator'],
  finance: ['super_admin', 'admin', 'finance'],
};

export function isAllowedForNav(actual: AdminRole, allowed: ReadonlyArray<AdminRole>): boolean {
  return allowed.some((required) => SATISFIES[required].includes(actual));
}
