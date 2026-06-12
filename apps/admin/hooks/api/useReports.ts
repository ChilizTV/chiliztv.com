'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moderationApi, type ReportsFilter } from '@/lib/api/endpoints/moderation';
import { queryKeys } from '@/lib/query/keys';

export function useReports(filter: ReportsFilter) {
  return useQuery({
    queryKey: queryKeys.reports.list(filter),
    queryFn: () => moderationApi.listReports(filter),
    select: (res) => res.data,
    staleTime: 15_000,
  });
}

export function useReportDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: () => moderationApi.getReport(id),
    select: (res) => res.data,
  });
}

export function useReviewReport(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ verdict, note }: { verdict: 'dismiss' | 'close'; note?: string }) =>
      verdict === 'dismiss' ? moderationApi.dismissReport(id, note) : moderationApi.closeReport(id, note),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useReverseAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, note }: { actionId: string; note?: string }) =>
      moderationApi.reverseAction(actionId, note),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reports.all });
      void qc.invalidateQueries({ queryKey: queryKeys.bans.all });
    },
  });
}
