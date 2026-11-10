import { useState } from 'react';
import { Archive, ArchiveRestore, Edit2, Plus, Target, Trash2 } from 'lucide-react';
import { Badge, Button, EmptyState, Label, Skeleton, Switch } from '@/components/ui';
import type {
  CreateObjectiveInput,
  Cycle,
  Goal,
  Objective,
  ObjectivePriority,
  ObjectiveStatus,
} from '../schema';
import {
  useArchiveObjective,
  useCreateObjective,
  useDeleteObjective,
  useObjectives,
  useRestoreObjective,
  useUpdateObjective,
} from '../hooks/useObjectives';
import { ObjectiveDialog } from './ObjectiveDialog';

interface ObjectivesListProps {
  workspaceId?: string;
  selectedCycle: Cycle | null;
  cycles: Cycle[];
  goals: Goal[];
}

const OBJECTIVE_STATUS_BADGES: Record<ObjectiveStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'text-text-3 bg-surface-2 border-border/50' },
  active: { label: 'Active', className: 'text-highlight bg-accent/20 border-highlight/30' },
  achieved: { label: 'Achieved', className: 'text-success bg-success/15 border-success/30' },
  abandoned: { label: 'Abandoned', className: 'text-danger bg-danger/15 border-danger/30' },
};

const OBJECTIVE_PRIORITY_BADGES: Record<ObjectivePriority, { label: string; className: string }> = {
  none: { label: 'None', className: 'text-text-3 bg-surface-2 border-border/50' },
  low: { label: 'Low', className: 'text-text-2 bg-surface-2 border-border' },
  medium: { label: 'Medium', className: 'text-highlight bg-accent/20 border-highlight/30' },
  high: { label: 'High', className: 'text-warning bg-warning/10 border-warning/30' },
  urgent: { label: 'Urgent', className: 'text-danger bg-danger/10 border-danger/30' },
};

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
          {objectives.map((obj) => {
            const parentGoal = obj.goal_id ? goalsMap.get(obj.goal_id) : null;
            const statusBadge = OBJECTIVE_STATUS_BADGES[(obj.status as ObjectiveStatus) || 'draft'];
            const priorityBadge =
              OBJECTIVE_PRIORITY_BADGES[(obj.priority as ObjectivePriority) || 'none'];
            const isArchived = Boolean(obj.archived_at);

            return (
              <article
                key={obj.id}
                data-testid={`objective-item-${obj.id}`}
                className={`p-4 rounded-[10px] border transition-colors flex flex-col gap-3 ${
                  isArchived
                    ? 'bg-surface/40 border-border/60 opacity-60'
                    : 'bg-surface border-border hover:border-border/90'
                }`}
              >
                {/* Header row: title, badges, and actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-[8px] bg-surface-2 border border-border flex items-center justify-center text-highlight shrink-0 mt-0.5">
                      <Target className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-text truncate">{obj.title}</h3>

                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-mono-num font-medium border px-1.5 py-0.2 ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </Badge>

                        {obj.priority !== 'none' && (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-mono-num font-medium border px-1.5 py-0.2 ${priorityBadge.className}`}
                          >
                            {priorityBadge.label}
                          </Badge>
                        )}

                        {obj.confidence !== null && obj.confidence !== undefined && (
                          <span className="font-mono-num text-[11px] px-1.5 py-0.2 rounded bg-surface-2 text-highlight border border-border">
                            Conf: {obj.confidence}/10
                          </span>
                        )}

                        {parentGoal && (
                          <span className="text-[11px] font-medium text-text-2 bg-surface-2 border border-border px-2 py-0.5 rounded truncate max-w-[160px]">
                            Goal: {parentGoal.title}
                          </span>
                        )}

                        {isArchived && (
                          <span className="font-mono-num text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-2 text-warning border border-border">
                            Archived
                          </span>
                        )}
                      </div>

                      {obj.description && (
                        <p className="text-xs text-text-2 line-clamp-2">{obj.description}</p>
                      )}

                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono-num text-text-3">
                        <span>
                          {obj.start_date} – {obj.due_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                    {!isArchived && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(obj)}
                        className="text-xs text-text-2 hover:text-text gap-1 h-8"
                        aria-label={`Edit ${obj.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                    )}

                    {isArchived ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreObjectiveMut(obj.id)}
                        className="text-xs text-highlight hover:text-text gap-1 h-8"
                        aria-label={`Restore ${obj.title}`}
                      >
                        <ArchiveRestore className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => archiveObjectiveMut(obj.id)}
                        className="text-xs text-text-3 hover:text-danger gap-1 h-8"
                        aria-label={`Archive ${obj.title}`}
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteObjectiveMut(obj.id)}
                      className="h-8 w-8 text-text-3 hover:text-danger"
                      aria-label={`Delete ${obj.title}`}
                      title="Delete objective"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Key results placeholder row (preparing for NS-25) */}
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-text-3">
                  <span className="italic">No key results yet.</span>
                  <span className="text-[11px] font-mono-num text-highlight">0 KRs linked</span>
                </div>
              </article>
            );
          })}
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
