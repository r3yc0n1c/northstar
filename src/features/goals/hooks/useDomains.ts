import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveDomain,
  createDomain,
  fetchDomains,
  reorderDomains,
  restoreDomain,
  updateDomain,
} from '../api/domains';
import type { CreateDomainInput, Domain, ReorderDomainsInput, UpdateDomainInput } from '../schema';

export const goalsKeys = {
  all: ['goals'] as const,
  domains: (workspaceId?: string, includeArchived = false) =>
    [...goalsKeys.all, 'domains', workspaceId, { includeArchived }] as const,
  vision: (workspaceId?: string) => [...goalsKeys.all, 'vision', workspaceId] as const,
  goals: (workspaceId?: string, options?: unknown) =>
    [...goalsKeys.all, 'goals-list', workspaceId, options ?? {}] as const,
  cycles: (workspaceId?: string, options?: unknown) =>
    [...goalsKeys.all, 'cycles', workspaceId, options ?? {}] as const,
  objectives: (workspaceId?: string, options?: unknown) =>
    [...goalsKeys.all, 'objectives', workspaceId, options ?? {}] as const,
  objectiveDetail: (objectiveId?: string) =>
    [...goalsKeys.all, 'objective-detail', objectiveId] as const,
  keyResults: (workspaceId?: string, options?: unknown) =>
    [...goalsKeys.all, 'key-results', workspaceId, options ?? {}] as const,
  keyResultDetail: (keyResultId?: string) =>
    [...goalsKeys.all, 'key-result-detail', keyResultId] as const,
  checkIns: (keyResultId?: string) => [...goalsKeys.all, 'check-ins', keyResultId] as const,
};

export function useDomains(workspaceId?: string, includeArchived = false) {
  return useQuery({
    queryKey: goalsKeys.domains(workspaceId, includeArchived),
    queryFn: () => {
      if (!workspaceId) throw new Error('Workspace ID is required to fetch domains');
      return fetchDomains(workspaceId, { includeArchived });
    },
    enabled: Boolean(workspaceId),
  });
}

export function useCreateDomain(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDomainInput) => {
      if (!workspaceId) throw new Error('Workspace ID is required to create a domain');
      return createDomain(workspaceId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...goalsKeys.all, 'domains', workspaceId] });
    },
  });
}

export function useUpdateDomain(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ domainId, input }: { domainId: string; input: UpdateDomainInput }) =>
      updateDomain(domainId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...goalsKeys.all, 'domains', workspaceId] });
    },
  });
}

export function useArchiveDomain(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domainId: string) => archiveDomain(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...goalsKeys.all, 'domains', workspaceId] });
    },
  });
}

export function useRestoreDomain(workspaceId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domainId: string) => restoreDomain(domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...goalsKeys.all, 'domains', workspaceId] });
    },
  });
}

export function useReorderDomains(workspaceId?: string, includeArchived = false) {
  const queryClient = useQueryClient();
  const queryKey = goalsKeys.domains(workspaceId, includeArchived);

  return useMutation({
    mutationFn: (items: ReorderDomainsInput) => reorderDomains(items),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey });
      const previousDomains = queryClient.getQueryData<Domain[]>(queryKey);

      if (previousDomains) {
        // Map new sort_order optimistically
        const orderMap = new Map(newOrder.map((item) => [item.id, item.sort_order]));
        const updated = [...previousDomains]
          .map((d) => ({
            ...d,
            sort_order: orderMap.has(d.id) ? (orderMap.get(d.id) as number) : d.sort_order,
          }))
          .sort((a, b) => a.sort_order - b.sort_order);

        queryClient.setQueryData<Domain[]>(queryKey, updated);
      }

      return { previousDomains };
    },
    onError: (_err, _newOrder, context) => {
      if (context?.previousDomains) {
        queryClient.setQueryData<Domain[]>(queryKey, context.previousDomains);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...goalsKeys.all, 'domains', workspaceId] });
    },
  });
}
