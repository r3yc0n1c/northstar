import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveObjective,
  createObjective,
  deleteObjective,
  fetchObjectiveById,
  fetchObjectives,
  type FetchObjectivesOptions,
  restoreObjective,
  updateObjective,
} from '../api/objectives';
import type { CreateObjectiveInput, UpdateObjectiveInput } from '../schema';
import { goalsKeys } from './useDomains';

export function useObjectives(workspaceId?: string, options?: FetchObjectivesOptions) {
  return useQuery({
    queryKey: goalsKeys.objectives(workspaceId, options),
    queryFn: () => {
      if (!workspaceId) throw new Error('Workspace ID is required to fetch objectives');
      return fetchObjectives(workspaceId, options);
    },
    enabled: Boolean(workspaceId),
  });
}

export function useObjectiveDetail(objectiveId?: string) {
  return useQuery({
    queryKey: goalsKeys.objectiveDetail(objectiveId),
    queryFn: () => {
      if (!objectiveId) throw new Error('Objective ID is required');
      return fetchObjectiveById(objectiveId);
    },
    enabled: Boolean(objectiveId),
  });
}

export function useCreateObjective(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateObjectiveInput) => {
      if (!workspaceId) throw new Error('Workspace ID is required to create an objective');
      return createObjective(workspaceId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
    },
  });
}

export function useUpdateObjective(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectiveId, input }: { objectiveId: string; input: UpdateObjectiveInput }) =>
      updateObjective(objectiveId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: goalsKeys.objectiveDetail(variables.objectiveId),
      });
    },
  });
}

export function useArchiveObjective(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectiveId: string) => archiveObjective(objectiveId),
    onSuccess: (_, objectiveId) => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: goalsKeys.objectiveDetail(objectiveId),
      });
    },
  });
}

export function useRestoreObjective(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectiveId: string) => restoreObjective(objectiveId),
    onSuccess: (_, objectiveId) => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: goalsKeys.objectiveDetail(objectiveId),
      });
    },
  });
}

export function useDeleteObjective(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectiveId: string) => deleteObjective(objectiveId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
    },
  });
}
