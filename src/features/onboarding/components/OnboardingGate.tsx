import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useProfile } from '@/features/settings';

export interface OnboardingGateProps {
  children?: ReactNode;
}

/**
 * Gatekeeper for the main application shell.
 * Per PRD §5.3 (FR-ONB):
 * - If the authenticated user has not completed onboarding (onboarding_completed_at == null),
 *   they are redirected to /onboarding.
 * - Once completed or skipped, the flow never blocks them again.
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Checking onboarding status"
        className="min-h-screen bg-bg flex items-center justify-center p-4"
      >
        <div className="w-8 h-8 border-2 border-highlight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user profile exists and onboarding has not been completed, redirect to /onboarding
  if (profile && !profile.onboarding_completed_at) {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? children : <Outlet />;
}
