import type { ReportSeverity } from '../value-objects/QuorumSnapshot';

export type ReportTargetType = 'stream' | 'message' | 'account';
export type ReportStatus = 'open' | 'auto_actioned' | 'dismissed' | 'closed';

export interface ReportProps {
    id: string;
    targetType: ReportTargetType;
    targetId: string;
    /** lowercase wallet (repo convention). */
    reporterWallet: string;
    liveContextMatchId: number | null;
    liveContextStreamId: string | null;
    reasonCode: string;
    reasonFreeText: string | null;
    /** Computed server-side from the taxonomy. */
    severity: ReportSeverity;
    status: ReportStatus;
    triggeredActionId: string | null;
    createdAt: Date;
    reviewedAt: Date | null;
    reviewedByWallet: string | null;
    reviewNote: string | null;
}

export class Report {
    private constructor(public readonly props: ReportProps) {}

    static create(
        props: Omit<ReportProps, 'id' | 'status' | 'triggeredActionId' | 'reviewedAt' | 'reviewedByWallet' | 'reviewNote'>,
    ): Report {
        return new Report({
            ...props,
            id: crypto.randomUUID(),
            reporterWallet: props.reporterWallet.toLowerCase(),
            status: 'open',
            triggeredActionId: null,
            reviewedAt: null,
            reviewedByWallet: null,
            reviewNote: null,
        });
    }

    static reconstitute(props: ReportProps): Report {
        return new Report(props);
    }
}
