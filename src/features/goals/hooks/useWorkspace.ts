import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { fetchCurrentWorkspace, type Workspace } from '../api/workspace';

export const workspaceKeys = {
  current: (userId?: string) => ['workspace', 'current', userId] as const,
};

export function useCurrentWorkspace() {
  const { user } = useAuth();

  return useQuery<Workspace>({
    queryKey: workspaceKeys.current(user?.id),
    queryFn: () => {
      if (!user?.id) throw new Error('Authenticated user required to fetch workspace');
      return fetchCurrentWorkspace(user.id);
    },
    enabled: Boolean(user?.id),
  });
}
