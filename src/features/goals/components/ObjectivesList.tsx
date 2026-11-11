import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { Button, EmptyState, Label, Skeleton, Switch } from '@/components/ui';
import type { CreateObjectiveInput, Cycle, Goal, Objective } from '../schema';
import {
  useArchiveObjective,
  useCreateObjective,
  useDeleteObjective,
  useObjectives,
  useRestoreObjective,
  useUpdateObjective,
} from '../hooks/useObjectives';
import { ObjectiveDialog } from './ObjectiveDialog';
import { ObjectiveCard } from './ObjectiveCard';

interface ObjectivesListProps {
  workspaceId?: string;
  selectedCycle: Cycle | null;
  cycles: Cycle[];
  goals: Goal[];
}

export function ObjectivesList({ workspaceId, selectedCycle, cycles, goals }: ObjectivesListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

  const {
    data: objectives = [],
    isLoading,
    error,
  } = useObjectives(workspaceId, {
    cycleId: selectedCycle?.id,
    includeArchived: showArchived,
  });

  const { mutateAsync: createObjectiveMut, isPending: isCreating } =
    useCreateObjective(workspaceId);
  const { mutateAsync: updateObjectiveMut, isPending: isUpdating } =
    useUpdateObjective(workspaceId);
  const { mutateAsync: archiveObjectiveMut } = useArchiveObjective(workspaceId);
  const { mutateAsync: restoreObjectiveMut } = useRestoreObjective(workspaceId);
  const { mutateAsync: deleteObjectiveMut } = useDeleteObjective(workspaceId);

  const goalsMap = new Map(goals.map((g) => [g.id, g]));

  const handleOpenCreate = () => {
    setEditingObjective(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (obj: Objective) => {
    setEditingObjective(obj);
    setIsDialogOpen(true);
  };

  const handleSaveObjective = async (input: CreateObjectiveInput) => {
    if (editingObjective) {
      await updateObjectiveMut({ objectiveId: editingObjective.id, input });
    } else {
      await createObjectiveMut(input);
    }
  };

  const activeObjectivesCount = objectives.filter((o) => !o.archived_at).length;

  return (
    <div className="space-y-6">
      {/* Header with Title, Count, Toggle and New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text">Objectives & Key Results</h2>
            <span className="font-mono-num text-xs px-2 py-0.5 rounded bg-surface-2 text-highlight border border-border">
              {activeObjectivesCount} Active
            </span>
          </div>
          <p className="text-xs text-text-2 mt-0.5">
            Quarterly outcomes and measurable key results for{' '}
            <span className="font-mono-num text-text font-semibold">
              {selectedCycle ? selectedCycle.name : 'all cycles'}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 select-none">
            <Switch
              id="show-archived-objectives-switch"
              checked={showArchived}
              onCheckedChange={setShowArchived}
              aria-label="Show archived objectives"
            />
            <Label
              htmlFor="show-archived-objectives-switch"
              className="text-xs text-text-2 cursor-pointer font-normal"
            >
              Show archived
            </Label>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            disabled={!selectedCycle}
            className="gap-1.5"
            aria-label="New Objective"
          >
            <Plus className="w-4 h-4" />
            <span>New Objective</span>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-[10px]" />
          <Skeleton className="h-28 w-full rounded-[10px]" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-[10px] bg-danger/10 border border-danger/30 text-danger text-sm">
          Failed to load objectives: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && objectives.length === 0 && (
        <EmptyState
          icon={Target}
          title={showArchived ? 'No objectives match the filter' : 'No key results yet'}
          description={`Objectives and measurable key results for ${
            selectedCycle ? selectedCycle.name : 'this cycle'
          } will appear here. Create an objective to anchor your key results.`}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              disabled={!selectedCycle}
            >
              Create First Objective
            </Button>
          }
        />
      )}

      {/* Objectives Cards List */}
      {!isLoading && objectives.length > 0 && (
        <div className="space-y-4" data-testid="objectives-list">
          {objectives.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              workspaceId={workspaceId}
              parentGoal={obj.goal_id ? goalsMap.get(obj.goal_id) : null}
              showArchived={showArchived}
              onEdit={handleOpenEdit}
              onArchive={(id) => archiveObjectiveMut(id)}
              onRestore={(id) => restoreObjectiveMut(id)}
              onDelete={(id) => deleteObjectiveMut(id)}
            />
          ))}
        </div>
      )}

      <ObjectiveDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        objective={editingObjective}
        cycles={cycles}
        goals={goals}
        defaultCycleId={selectedCycle?.id}
        onSave={handleSaveObjective}
        isSaving={isCreating || isUpdating}
      />
    </div>
  );
}
