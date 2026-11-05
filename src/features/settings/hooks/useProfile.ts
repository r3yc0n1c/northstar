import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  exportUserData,
  profileKeys,
  type ProfileRow,
  type ProfileUpdate,
} from '../api/profile';

/**
 * Hook to retrieve user profile settings.
 */
export function useProfile(userId?: string | null) {
  return useQuery({
    queryKey: userId ? profileKeys.detail(userId) : profileKeys.all,
    queryFn: () => {
      if (!userId) return null;
      return getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update user profile settings with optimistic cache update and rollback.
 */
export function useUpdateProfile(userId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: ProfileUpdate) => {
      if (!userId) throw new Error('Cannot update profile without userId');
      return updateProfile(userId, updates);
    },
    onMutate: async (updates) => {
      if (!userId) return;

      const queryKey = profileKeys.detail(userId);
      await queryClient.cancelQueries({ queryKey });

      const previousProfile = queryClient.getQueryData<ProfileRow>(queryKey);

      if (previousProfile) {
        queryClient.setQueryData<ProfileRow>(queryKey, {
          ...previousProfile,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousProfile };
    },
    onError: (_err, _updates, context) => {
      if (userId && context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(userId), context.previousProfile);
      }
    },
    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      }
    },
  });
}

/**
 * Hook to export all user workspace data to a downloaded JSON file (FR-SET-4).
 */
export function useExportData(userId?: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Cannot export data without userId');
      return exportUserData(userId);
    },
    onSuccess: (data) => {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2),
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `northstar-backup-${new Date().toISOString().slice(0, 10)}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },
  });
}
