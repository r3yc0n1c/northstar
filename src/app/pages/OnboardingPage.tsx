import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useProfile } from '@/features/settings';
import { OnboardingWizard } from '@/features/onboarding';
import { ErrorState } from '@/components/ui';

export function OnboardingPage() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useProfile(user?.id);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading onboarding"
        className="min-h-screen bg-bg flex items-center justify-center p-4"
      >
        <div className="w-8 h-8 border-2 border-highlight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorState
            title="Failed to load setup"
            message={error instanceof Error ? error.message : 'Unable to initialize onboarding.'}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  // Once completed, the onboarding flow never reappears (FR-ONB)
  if (profile.onboarding_completed_at) {
    return <Navigate to="/today" replace />;
  }

  return <OnboardingWizard />;
}
