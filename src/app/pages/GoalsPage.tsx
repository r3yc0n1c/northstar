import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Target, Flag, Folder, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button, Skeleton, ErrorState } from '@/components/ui';
import {
  VisionCard,
  GoalsNavigationTabs,
  LifeAreasList,
  useCurrentWorkspace,
  useDomains,
  type GoalsTab,
} from '@/features/goals';

export function GoalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as GoalsTab) || 'okrs';
  const [activeTab, setActiveTab] = useState<GoalsTab>(
    initialTab === 'goals' || initialTab === 'areas' ? initialTab : 'okrs',
  );

  const {
    data: workspace,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
    refetch,
  } = useCurrentWorkspace();

  const { data: domains = [] } = useDomains(workspace?.id);
  const activeAreasCount = domains.filter((d) => !d.archived_at).length;

  const handleTabChange = (tab: GoalsTab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'okrs' ? {} : { tab });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals & OKRs"
        description="Life areas, high-level goals, and measurable key results connected to quarterly cycles."
      />

      {isWorkspaceLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-[10px]" />
          <Skeleton className="h-10 w-72 rounded-[10px]" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-[10px]" />
            <Skeleton className="h-16 w-full rounded-[10px]" />
          </div>
        </div>
      ) : workspaceError || !workspace ? (
        <ErrorState
          title="Failed to load workspace"
          message={
            workspaceError instanceof Error ? workspaceError.message : 'Workspace not found.'
          }
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-6">
          {/* Lifetime Anchor Vision Statement Card */}
          <VisionCard workspaceId={workspace.id} />

          {/* Navigation Tab Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <GoalsNavigationTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              areasCount={activeAreasCount}
              goalsCount={0}
              okrsCount={0}
            />
          </div>

          {/* Tab Content */}
          {activeTab === 'areas' && (
            <div data-testid="life-areas-tab-content">
              <LifeAreasList workspaceId={workspace.id} />
            </div>
          )}

          {activeTab === 'okrs' && (
            <div data-testid="okrs-tab-content" className="space-y-6">
              <EmptyState
                icon={Target}
                title="No active OKRs yet"
                description="Quarterly cycles and measurable key results will be tracked here. Start by setting up your life dimensions in Life Areas."
                action={
                  <Button variant="secondary" size="sm" onClick={() => handleTabChange('areas')}>
                    <Folder className="h-4 w-4 mr-1.5" />
                    Configure Life Areas
                  </Button>
                }
              />
            </div>
          )}

          {activeTab === 'goals' && (
            <div data-testid="goals-tab-content" className="space-y-6">
              <EmptyState
                icon={Flag}
                title="No long-term goals configured"
                description="High-level directional goals tied to your life areas will live here."
                action={
                  <Button variant="secondary" size="sm" onClick={() => handleTabChange('areas')}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Set Up Life Areas First
                  </Button>
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
