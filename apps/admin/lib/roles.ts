export const ADMIN_ROLES = ['super_admin', 'admin', 'moderator', 'finance'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
