import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Skeleton, ErrorState } from '@/components/ui';
import { selectCurrentCycle } from '@/domain/cycles';
import {
  VisionCard,
  GoalsNavigationTabs,
  LifeAreasList,
  GoalsList,
  CycleSelector,
  ObjectivesList,
  useCurrentWorkspace,
  useDomains,
  useGoals,
  useCycles,
  useObjectives,
  useCreateCycle,
  useUpdateCycle,
  useDeleteCycle,
  type GoalsTab,
  type Cycle,
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
  const { data: goals = [] } = useGoals(workspace?.id, { includeArchived: false });
  const { data: cycles = [] } = useCycles(workspace?.id);
  const { mutateAsync: createCycleMut, isPending: isCreatingCycle } = useCreateCycle(workspace?.id);
  const { mutateAsync: updateCycleMut, isPending: isUpdatingCycle } = useUpdateCycle(workspace?.id);
  const { mutateAsync: deleteCycleMut } = useDeleteCycle(workspace?.id);

  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  // Sync selectedCycle to today's active cycle if not explicitly picked
  useEffect(() => {
    if (cycles.length > 0 && !selectedCycleId) {
      const today = new Date().toISOString().slice(0, 10);
      const current = selectCurrentCycle(cycles, today);
      if (current?.id) {
        setSelectedCycleId(current.id);
      }
    }
  }, [cycles, selectedCycleId]);

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId) || cycles[0] || null;

  const { data: cycleObjectives = [] } = useObjectives(workspace?.id, {
    cycleId: selectedCycle?.id,
    includeArchived: false,
  });

  const activeAreasCount = domains.filter((d) => !d.archived_at).length;
  const activeGoalsCount = goals.filter((g) => !g.archived_at).length;
  const activeOkrsCount = cycleObjectives.filter((o) => !o.archived_at).length;

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

          {/* Navigation Tab Bar & Optional Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <GoalsNavigationTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              areasCount={activeAreasCount}
              goalsCount={activeGoalsCount}
              okrsCount={activeOkrsCount}
            />

            {activeTab === 'okrs' && (
              <CycleSelector
                cycles={cycles}
                selectedCycle={selectedCycle}
                onSelectCycle={(cycle: Cycle) => setSelectedCycleId(cycle.id)}
                onCreateCycle={async (input) => {
                  const created = await createCycleMut(input);
                  setSelectedCycleId(created.id);
                }}
                onUpdateCycle={async (cycleId, input) => {
                  await updateCycleMut({ cycleId, input });
                }}
                onDeleteCycle={async (cycleId) => {
                  await deleteCycleMut(cycleId);
                  if (selectedCycleId === cycleId) {
                    setSelectedCycleId(null);
                  }
                }}
                isCreating={isCreatingCycle}
                isUpdating={isUpdatingCycle}
              />
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'areas' && (
            <div data-testid="life-areas-tab-content">
              <LifeAreasList workspaceId={workspace.id} />
            </div>
          )}

          {activeTab === 'goals' && (
            <div data-testid="goals-tab-content">
              <GoalsList workspaceId={workspace.id} domains={domains} />
            </div>
          )}

          {activeTab === 'okrs' && (
            <div data-testid="okrs-tab-content" className="space-y-6">
              <ObjectivesList
                workspaceId={workspace.id}
                selectedCycle={selectedCycle}
                cycles={cycles}
                goals={goals}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
