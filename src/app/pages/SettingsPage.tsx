import { PageHeader, Skeleton, ErrorState } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useProfile, ProfileSettingsForm } from '@/features/settings';

export function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError, error, refetch } = useProfile(user?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Profile preferences, timezone calibration, working hours, and data export."
      />

      <div className="max-w-3xl">
        {isLoading ? (
          <div className="space-y-6" data-purpose="settings-loading-skeleton">
            <div className="p-6 rounded-[10px] border border-border bg-surface space-y-4">
              <Skeleton className="h-5 w-48" />
              <div className="flex items-center gap-5">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full max-w-md" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[10px] border border-border bg-surface space-y-4">
              <Skeleton className="h-5 w-56" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>

            <div className="p-6 rounded-[10px] border border-border bg-surface space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        ) : isError || !profile ? (
          <ErrorState
            title="Failed to load settings"
            message={
              error instanceof Error ? error.message : 'Unable to retrieve profile settings.'
            }
            onRetry={() => refetch()}
          />
        ) : (
          <ProfileSettingsForm profile={profile} />
        )}
      </div>
    </div>
  );
}
