import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveGoal,
  createGoal,
  deleteGoal,
  fetchGoals,
  type FetchGoalsOptions,
  restoreGoal,
  updateGoal,
} from '../api/goals';
import type { CreateGoalInput, UpdateGoalInput } from '../schema';
import { goalsKeys } from './useDomains';

export function useGoals(workspaceId?: string, options?: FetchGoalsOptions) {
  return useQuery({
    queryKey: goalsKeys.goals(workspaceId, options),
    queryFn: () => {
      if (!workspaceId) throw new Error('Workspace ID is required to fetch goals');
      return fetchGoals(workspaceId, options);
    },
    enabled: Boolean(workspaceId),
  });
}

export function useCreateGoal(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGoalInput) => {
      if (!workspaceId) throw new Error('Workspace ID is required to create a goal');
      return createGoal(workspaceId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'goals-list', workspaceId],
      });
    },
  });
}

export function useUpdateGoal(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, input }: { goalId: string; input: UpdateGoalInput }) =>
      updateGoal(goalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'goals-list', workspaceId],
      });
    },
  });
}

export function useArchiveGoal(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => archiveGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'goals-list', workspaceId],
      });
    },
  });
}

export function useRestoreGoal(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => restoreGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'goals-list', workspaceId],
      });
    },
  });
}

export function useDeleteGoal(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'goals-list', workspaceId],
      });
    },
  });
}
