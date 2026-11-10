import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCycle,
  deleteCycle,
  fetchCycles,
  type FetchCyclesOptions,
  updateCycle,
} from '../api/cycles';
import type { CreateCycleInput, UpdateCycleInput } from '../schema';
import { goalsKeys } from './useDomains';

export function useCycles(workspaceId?: string, options?: FetchCyclesOptions) {
  return useQuery({
    queryKey: goalsKeys.cycles(workspaceId, options),
    queryFn: () => {
      if (!workspaceId) throw new Error('Workspace ID is required to fetch cycles');
      return fetchCycles(workspaceId, options);
    },
    enabled: Boolean(workspaceId),
  });
}

export function useCreateCycle(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCycleInput) => {
      if (!workspaceId) throw new Error('Workspace ID is required to create a cycle');
      return createCycle(workspaceId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'cycles', workspaceId],
      });
    },
  });
}

export function useUpdateCycle(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cycleId, input }: { cycleId: string; input: UpdateCycleInput }) =>
      updateCycle(cycleId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'cycles', workspaceId],
      });
    },
  });
}

export function useDeleteCycle(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycleId: string) => deleteCycle(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'cycles', workspaceId],
      });
    },
  });
}
