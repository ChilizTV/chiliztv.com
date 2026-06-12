export const ADMIN_ROLES = ['super_admin', 'admin', 'moderator', 'finance'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(value: string): value is AdminRole {
    return (ADMIN_ROLES as readonly string[]).includes(value);
}
