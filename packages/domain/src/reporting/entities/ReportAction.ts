import type { QuorumSnapshot } from '../value-objects/QuorumSnapshot';
import type { ReportTargetType } from './Report';

export type ActionKind = 'soft_delete_message' | 'stop_stream' | 'ban_account';

export interface ReportActionProps {
    id: string;
    kind: ActionKind;
    targetType: ReportTargetType;
    targetId: string;
    liveContextMatchId: number | null;
    quorumSnapshot: QuorumSnapshot;
    reporterWallets: string[];
    triggeredAt: Date;
    reversedAt: Date | null;
    reversedByWallet: string | null;
    reverseNote: string | null;
    affectedMessageId: string | null;
    affectedStreamId: string | null;
    affectedBanId: string | null;
}

export class ReportAction {
    private constructor(public readonly props: ReportActionProps) {}

    static create(
        props: Omit<ReportActionProps, 'id' | 'reversedAt' | 'reversedByWallet' | 'reverseNote'>,
    ): ReportAction {
        return new ReportAction({
            ...props,
            id: crypto.randomUUID(),
            reversedAt: null,
            reversedByWallet: null,
            reverseNote: null,
        });
    }

    static reconstitute(props: ReportActionProps): ReportAction {
        return new ReportAction(props);
    }
}
