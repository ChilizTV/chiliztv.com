'use client';

import { toast } from 'sonner';

import type { AdminMatchSummaryDto } from '@/lib/api/endpoints/directory';
import { useCloseMatchMarkets, useDeployMatchContract } from '@/hooks/api/useAdminMatches';
import { ConfirmActionButton } from '@/components/common/ConfirmActionButton';

const FINISHED = new Set(['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO']);

function apiError(err: unknown): string {
  const data = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data;
  return data?.error?.message ?? 'Request failed';
}

export function MatchRowActions({ match }: Readonly<{ match: AdminMatchSummaryDto }>) {
  const deploy = useDeployMatchContract();
  const close = useCloseMatchMarkets();

  if (FINISHED.has(match.status)) return null;

  if (!match.bettingContractAddress) {
    return (
      <ConfirmActionButton
        label="Deploy"
        confirmLabel="Confirm deploy?"
        pending={deploy.isPending}
        onConfirm={() =>
          deploy.mutate(match.id, {
            onSuccess: (res) => toast.success(`Contract deployed ${res.data.contractAddress.slice(0, 10)}…`),
            onError: (err) => toast.error(apiError(err)),
          })
        }
      />
    );
  }

  return (
    <ConfirmActionButton
      label="Close markets"
      confirmLabel="Confirm close?"
      pending={close.isPending}
      danger
      onConfirm={() =>
        close.mutate(match.id, {
          onSuccess: (res) => toast.success(`${res.data.closed} market(s) closed, ${res.data.skipped} skipped`),
          onError: (err) => toast.error(apiError(err)),
        })
      }
    />
  );
}
