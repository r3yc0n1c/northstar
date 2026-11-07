import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { completeOnboarding, skipOnboarding } from '../api/onboarding';
import type { CompleteOnboardingPayload } from '../schema';
import { profileKeys } from '@/features/settings';

export function useOnboarding(userId?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const skipMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required to skip onboarding');
      return skipOnboarding(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      }
      navigate('/today', { replace: true });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (payload: Omit<CompleteOnboardingPayload, 'userId'>) => {
      if (!userId) throw new Error('User ID is required to complete onboarding');
      return completeOnboarding({ ...payload, userId });
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      }
      navigate('/today', { replace: true });
    },
  });

  return {
    skipOnboarding: skipMutation.mutateAsync,
    isSkipping: skipMutation.isPending,
    completeOnboarding: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    error: skipMutation.error || completeMutation.error,
  };
}
