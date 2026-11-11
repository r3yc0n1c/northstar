import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchKrCheckIns, recordKrCheckIn } from '../api/checkIns';
import type { KrCheckIn, RecordCheckInInput } from '../schema';
import { goalsKeys } from './useDomains';

export function useKrCheckIns(keyResultId?: string) {
  return useQuery({
    queryKey: goalsKeys.checkIns(keyResultId),
    queryFn: () => {
      if (!keyResultId) throw new Error('Key Result ID is required to fetch check-ins');
      return fetchKrCheckIns(keyResultId);
    },
    enabled: Boolean(keyResultId),
  });
}

export function useRecordCheckIn(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecordCheckInInput) => recordKrCheckIn(input),
    onSuccess: (data: KrCheckIn) => {
      queryClient.invalidateQueries({
        queryKey: goalsKeys.checkIns(data.key_result_id),
      });
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'key-results', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: goalsKeys.keyResultDetail(data.key_result_id),
      });
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
    },
  });
}
