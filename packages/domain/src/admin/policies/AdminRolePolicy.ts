import type { AdminRole } from '../types';

// Which actual roles satisfy a given requirement. moderator and finance are
// sibling scopes; admin covers both; super_admin covers everything.
const SATISFIES: Readonly<Record<AdminRole, ReadonlySet<AdminRole>>> = {
    super_admin: new Set(['super_admin']),
    admin:       new Set(['super_admin', 'admin']),
    moderator:   new Set(['super_admin', 'admin', 'moderator']),
    finance:     new Set(['super_admin', 'admin', 'finance']),
};

/** True when `actual` satisfies at least one of the `allowed` requirements. */
export function isAllowed(actual: AdminRole, allowed: ReadonlyArray<AdminRole>): boolean {
    return allowed.some((required) => SATISFIES[required].has(actual));
}
