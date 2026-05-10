import { injectable, inject } from 'tsyringe';
import { isAddress } from 'viem';
import { TOKENS } from '@chiliztv/domain/shared/tokens';
import { UserProfile } from '@chiliztv/domain/users/entities/UserProfile';
import { IUserProfileRepository } from '@chiliztv/domain/users/repositories/IUserProfileRepository';

const USERNAME_PATTERN = /^[A-Za-z0-9._-]{1,30}$/;

export interface UpsertUserProfileInput {
    walletAddress: string;
    /** May be null when the user explicitly clears their handle. */
    username: string | null;
    /** Public CDN URL of the avatar image, or null. */
    avatarUrl?: string | null;
}

/**
 * Write-side use case — called by the frontend on Dynamic Labs sign-in
 * (auto-upsert) and by the avatar upload pipeline.
 *
 * Validation is intentionally permissive: usernames must match a safe
 * regex, but we don't enforce ownership of `walletAddress` on this
 * surface — same posture as `chat_messages.username`. Wallet ownership
 * proof (SIWE) is tracked in the plan as out-of-scope for v1.
 */
@injectable()
export class UpsertUserProfileUseCase {
    constructor(
        @inject(TOKENS.IUserProfileRepository)
        private readonly users: IUserProfileRepository,
    ) {}

    async execute(input: UpsertUserProfileInput): Promise<UserProfile> {
        if (!input.walletAddress || !isAddress(input.walletAddress)) {
            throw new Error('Invalid walletAddress');
        }
        const username = sanitiseUsername(input.username);
        const avatarUrl = sanitiseAvatarUrl(input.avatarUrl);
        const profile = UserProfile.create({
            walletAddress: input.walletAddress,
            username,
            avatarUrl,
            updatedAt: new Date(),
        });
        await this.users.upsert(profile);
        return profile;
    }
}

function sanitiseUsername(value: string | null | undefined): string | null {
    if (value == null) return null;
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    if (!USERNAME_PATTERN.test(trimmed)) {
        throw new Error('Username must be 1-30 chars and match [A-Za-z0-9._-]');
    }
    return trimmed;
}

function sanitiseAvatarUrl(value: string | null | undefined): string | null {
    if (value == null) return null;
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    if (!/^https?:\/\//i.test(trimmed)) {
        throw new Error('avatarUrl must be an http(s) URL');
    }
    return trimmed;
}
