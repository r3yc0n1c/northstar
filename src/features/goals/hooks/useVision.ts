import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWorkspaceVision, updateWorkspaceVision } from '../api/vision';
import { goalsKeys } from './useDomains';

export function useWorkspaceVision(workspaceId?: string) {
  return useQuery({
    queryKey: goalsKeys.vision(workspaceId),
    queryFn: () => {
      if (!workspaceId) throw new Error('Workspace ID is required to fetch vision');
      return fetchWorkspaceVision(workspaceId);
    },
    enabled: Boolean(workspaceId),
  });
}

export function useUpdateWorkspaceVision(workspaceId?: string) {
  const queryClient = useQueryClient();
  const queryKey = goalsKeys.vision(workspaceId);

  return useMutation({
    mutationFn: (vision: string) => {
      if (!workspaceId) throw new Error('Workspace ID is required to update vision');
      return updateWorkspaceVision(workspaceId, vision);
    },
    onMutate: async (newVision) => {
      await queryClient.cancelQueries({ queryKey });
      const previousVision = queryClient.getQueryData<string>(queryKey);
      queryClient.setQueryData<string>(queryKey, newVision.trim());
      return { previousVision };
    },
    onError: (_err, _newVision, context) => {
      if (context?.previousVision !== undefined) {
        queryClient.setQueryData<string>(queryKey, context.previousVision);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
