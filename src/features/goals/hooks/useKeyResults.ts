import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type FetchKeyResultsOptions,
  archiveKeyResult,
  createKeyResult,
  deleteKeyResult,
  fetchKeyResultById,
  fetchKeyResults,
  restoreKeyResult,
  updateKeyResult,
} from '../api/keyResults';
import type { CreateKeyResultInput, KeyResult, UpdateKeyResultInput } from '../schema';
import { goalsKeys } from './useDomains';

export function useKeyResults(workspaceId?: string, options?: FetchKeyResultsOptions) {
  return useQuery({
    queryKey: goalsKeys.keyResults(workspaceId, options),
    queryFn: () => {
      if (!workspaceId) throw new Error('Workspace ID is required to fetch key results');
      return fetchKeyResults(workspaceId, options);
    },
    enabled: Boolean(workspaceId),
  });
}

export function useKeyResultDetail(keyResultId?: string) {
  return useQuery({
    queryKey: goalsKeys.keyResultDetail(keyResultId),
    queryFn: () => {
      if (!keyResultId) throw new Error('Key Result ID is required');
      return fetchKeyResultById(keyResultId);
    },
    enabled: Boolean(keyResultId),
  });
}

export function useCreateKeyResult(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateKeyResultInput) => {
      if (!workspaceId) throw new Error('Workspace ID is required to create a key result');
      return createKeyResult(workspaceId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'key-results', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
    },
  });
}

export function useUpdateKeyResult(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keyResultId, input }: { keyResultId: string; input: UpdateKeyResultInput }) => {
      return updateKeyResult(keyResultId, input);
    },
    onSuccess: (data: KeyResult) => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'key-results', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: goalsKeys.keyResultDetail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
    },
  });
}

export function useArchiveKeyResult(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyResultId: string) => archiveKeyResult(keyResultId),
    onSuccess: (data: KeyResult) => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'key-results', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: goalsKeys.keyResultDetail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
    },
  });
}

export function useRestoreKeyResult(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyResultId: string) => restoreKeyResult(keyResultId),
    onSuccess: (data: KeyResult) => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'key-results', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: goalsKeys.keyResultDetail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
    },
  });
}

export function useDeleteKeyResult(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyResultId: string) => deleteKeyResult(keyResultId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'key-results', workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [...goalsKeys.all, 'objectives', workspaceId],
      });
    },
  });
}
