import type { QuorumSnapshot } from '../value-objects/QuorumSnapshot';

export type BanStatus = 'active' | 'expired' | 'lifted_by_admin' | 'lifted_by_appeal';

export interface BanProps {
    id: string;
    /** lowercase wallet. */
    walletAddress: string;
    status: BanStatus;
    triggeredByReportId: string | null;
    triggeringLiveMatchId: number | null;
    quorumSnapshot: QuorumSnapshot;
    startsAt: Date;
    /** null = permanent. */
    expiresAt: Date | null;
    endedAt: Date | null;
    escalationIndex: number;
    liftedByWallet: string | null;
    liftNote: string | null;
}

export class Ban {
    private constructor(public readonly props: BanProps) {}

    static create(
        props: Omit<BanProps, 'id' | 'status' | 'endedAt' | 'liftedByWallet' | 'liftNote'>,
    ): Ban {
        return new Ban({
            ...props,
            id: crypto.randomUUID(),
            walletAddress: props.walletAddress.toLowerCase(),
            status: 'active',
            endedAt: null,
            liftedByWallet: null,
            liftNote: null,
        });
    }

    static reconstitute(props: BanProps): Ban {
        return new Ban(props);
    }

    /**
     * Enforcement is time-derived, never cron-derived: a ban whose expiry has
     * passed no longer binds even if the hygiene job has not flipped its
     * status yet.
     */
    isActiveAt(now: Date): boolean {
        return (
            this.props.status === 'active' &&
            (this.props.expiresAt === null || this.props.expiresAt.getTime() > now.getTime())
        );
    }

    isPermanent(): boolean {
        return this.props.expiresAt === null;
    }
}
