'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moderationApi, type ReportConfigDto } from '@/lib/api/endpoints/moderation';
import { queryKeys } from '@/lib/query/keys';

export function useReportConfig() {
  return useQuery({
    queryKey: queryKeys.reportConfig,
    queryFn: () => moderationApi.getReportConfig(),
    select: (res) => res.data,
  });
}

export function useUpdateReportConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<ReportConfigDto>) => moderationApi.putReportConfig(patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reportConfig });
    },
  });
}
