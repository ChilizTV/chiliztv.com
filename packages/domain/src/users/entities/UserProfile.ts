/**
 * Public display profile attached to a wallet address.
 *
 * Lives in the centralized `users` table (Supabase) but is *not* an account
 * — Dynamic Labs remains the source of truth for identity. The wallet
 * address is the canonical key; everything else is display metadata that
 * may be null until the user authenticates (Dynamic Labs upsert) or until
 * the multi-source fallback picks up a denormalized snapshot from
 * `chat_messages` / `predictions` / `live_streams`.
 *
 * Walletless usernames never exist — the address PK enforces that.
 */
export interface UserProfileProps {
    /** Lowercase 0x address. Canonical form across the codebase. */
    walletAddress: string;
    /** Display name supplied by Dynamic Labs or backfilled from chat/bets. */
    username: string | null;
    /** Public URL of the user's avatar image, or null when only initials are available. */
    avatarUrl: string | null;
    /** Last time the row was touched — drives staleness diagnostics. */
    updatedAt: Date;
}

export class UserProfile {
    private constructor(private readonly props: UserProfileProps) {}

    static create(props: UserProfileProps): UserProfile {
        if (!props.walletAddress.startsWith('0x') || props.walletAddress.length !== 42) {
            throw new Error('UserProfile: walletAddress must be a valid 0x-prefixed 20-byte hex string');
        }
        return new UserProfile({
            ...props,
            walletAddress: props.walletAddress.toLowerCase(),
        });
    }

    get walletAddress(): string {
        return this.props.walletAddress;
    }
    get username(): string | null {
        return this.props.username;
    }
    get avatarUrl(): string | null {
        return this.props.avatarUrl;
    }
    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toJSON(): UserProfileProps {
        return { ...this.props };
    }
}
