import { useMutation } from '@tanstack/react-query';
import { waitlistApi, JoinWaitlistDTO } from '@/lib/api/endpoints';

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (data: JoinWaitlistDTO) => waitlistApi.join(data),
  });
}
