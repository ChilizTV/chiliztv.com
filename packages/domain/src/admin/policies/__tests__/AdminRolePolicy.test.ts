import { describe, expect, it } from 'vitest';
import { isAllowed } from '../AdminRolePolicy';

describe('AdminRolePolicy.isAllowed', () => {
    it('super_admin satisfies every requirement', () => {
        for (const req of ['super_admin', 'admin', 'moderator', 'finance'] as const) {
            expect(isAllowed('super_admin', [req])).toBe(true);
        }
    });

    it('admin satisfies admin, moderator and finance but not super_admin', () => {
        expect(isAllowed('admin', ['admin'])).toBe(true);
        expect(isAllowed('admin', ['moderator'])).toBe(true);
        expect(isAllowed('admin', ['finance'])).toBe(true);
        expect(isAllowed('admin', ['super_admin'])).toBe(false);
    });

    it('moderator and finance are sibling scopes', () => {
        expect(isAllowed('moderator', ['moderator'])).toBe(true);
        expect(isAllowed('moderator', ['finance'])).toBe(false);
        expect(isAllowed('moderator', ['admin'])).toBe(false);
        expect(isAllowed('finance', ['finance'])).toBe(true);
        expect(isAllowed('finance', ['moderator'])).toBe(false);
    });

    it('passes when any requirement in the list is satisfied', () => {
        expect(isAllowed('finance', ['moderator', 'finance'])).toBe(true);
        expect(isAllowed('moderator', ['finance', 'super_admin'])).toBe(false);
    });
});
