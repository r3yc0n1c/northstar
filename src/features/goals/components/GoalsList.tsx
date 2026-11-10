import { useState } from 'react';
import { Archive, ArchiveRestore, Edit2, Flag, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
} from '@/components/ui';
import type { CreateGoalInput, Domain, Goal, GoalPriority } from '../schema';
import {
  useArchiveGoal,
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useRestoreGoal,
  useUpdateGoal,
} from '../hooks/useGoals';
import { DomainIcon } from './DomainIcon';
import { GoalDialog } from './GoalDialog';

interface GoalsListProps {
  workspaceId?: string;
  domains: Domain[];
}

const PRIORITY_BADGES: Record<GoalPriority, { label: string; className: string }> = {
  none: { label: 'None', className: 'text-text-3 bg-surface-2 border-border/50' },
  low: { label: 'Low', className: 'text-text-2 bg-surface-2 border-border' },
  medium: { label: 'Medium', className: 'text-highlight bg-accent/20 border-highlight/30' },
  high: { label: 'High', className: 'text-warning bg-warning/10 border-warning/30' },
  urgent: { label: 'Urgent', className: 'text-danger bg-danger/10 border-danger/30' },
};

export function GoalsList({ workspaceId, domains }: GoalsListProps) {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const {
    data: goals = [],
    isLoading,
    error,
  } = useGoals(workspaceId, {
    domainId:
      selectedDomainId === 'all'
        ? undefined
        : selectedDomainId === 'none'
          ? null
          : selectedDomainId,
    includeArchived: showArchived,
  });

  const { mutateAsync: createGoalMut, isPending: isCreating } = useCreateGoal(workspaceId);
  const { mutateAsync: updateGoalMut, isPending: isUpdating } = useUpdateGoal(workspaceId);
  const { mutateAsync: archiveGoalMut } = useArchiveGoal(workspaceId);
  const { mutateAsync: restoreGoalMut } = useRestoreGoal(workspaceId);
  const { mutateAsync: deleteGoalMut } = useDeleteGoal(workspaceId);

  const filteredGoals = goals.filter((g) => {
    if (selectedPriority !== 'all' && g.priority !== selectedPriority) return false;
    return true;
  });

  const domainMap = new Map(domains.map((d) => [d.id, d]));

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };

  const handleSaveGoal = async (input: CreateGoalInput) => {
    if (editingGoal) {
      await updateGoalMut({ goalId: editingGoal.id, input });
    } else {
      await createGoalMut(input);
    }
  };

  const activeGoalsCount = goals.filter((g) => !g.archived_at).length;

  return (
    <div className="space-y-6">
      {/* Controls & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text">Long-term Goals</h2>
            <span className="font-mono-num text-xs px-2 py-0.5 rounded bg-surface-2 text-highlight border border-border">
              {activeGoalsCount} Active
            </span>
          </div>
          <p className="text-xs text-text-2 mt-0.5">
            Directional outcomes tied to your life areas that span beyond single quarters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5"
            aria-label="New Goal"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-border rounded-[10px]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Domain Filter */}
          <div className="w-44">
            <Select value={selectedDomainId} onValueChange={setSelectedDomainId}>
              <SelectTrigger className="h-8 text-xs" aria-label="Filter by Life Area">
                <SelectValue placeholder="All Life Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Life Areas</SelectItem>
                <SelectItem value="none">No Area Assigned</SelectItem>
                {domains.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="w-36">
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="h-8 text-xs" aria-label="Filter by Priority">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Show Archived Switch */}
        <div className="flex items-center gap-2 select-none">
          <Switch
            id="show-archived-goals-switch"
            checked={showArchived}
            onCheckedChange={setShowArchived}
            aria-label="Show archived goals"
          />
          <Label
            htmlFor="show-archived-goals-switch"
            className="text-xs text-text-2 cursor-pointer font-normal"
          >
            Show archived
          </Label>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-[10px]" />
          <Skeleton className="h-20 w-full rounded-[10px]" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-[10px] bg-danger/10 border border-danger/30 text-danger text-sm">
          Failed to load goals: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredGoals.length === 0 && (
        <EmptyState
          icon={Flag}
          title={showArchived ? 'No goals match the filter' : 'No active goals'}
          description="Create meaningful long-term goals to orient your quarters and daily planning."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              Create First Goal
            </Button>
          }
        />
      )}

      {/* Goals Cards List */}
      {!isLoading && filteredGoals.length > 0 && (
        <div className="space-y-3" data-testid="goals-list">
          {filteredGoals.map((goal) => {
            const domain = goal.domain_id ? domainMap.get(goal.domain_id) : null;
            const priorityBadge = PRIORITY_BADGES[(goal.priority as GoalPriority) || 'none'];
            const isArchived = Boolean(goal.archived_at);

            return (
              <article
                key={goal.id}
                data-testid={`goal-item-${goal.id}`}
                className={`p-4 rounded-[10px] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isArchived
                    ? 'bg-surface/40 border-border/60 opacity-60'
                    : 'bg-surface border-border hover:border-border/90'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[8px] bg-surface-2 border border-border flex items-center justify-center text-highlight shrink-0 mt-0.5">
                    <Flag className="w-4 h-4" />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-text truncate">{goal.title}</h3>

                      {domain && (
                        <span
                          className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[4px] border text-bg"
                          style={{
                            backgroundColor: domain.color || 'var(--accent)',
                            borderColor: domain.color || 'var(--accent)',
                          }}
                        >
                          <DomainIcon name={domain.icon} className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{domain.name}</span>
                        </span>
                      )}

                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-mono-num font-medium border px-1.5 py-0.2 ${priorityBadge.className}`}
                      >
                        {priorityBadge.label}
                      </Badge>

                      {isArchived && (
                        <span className="font-mono-num text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-2 text-warning border border-border">
                          Archived
                        </span>
                      )}
                    </div>

                    {goal.description && (
                      <p className="text-xs text-text-2 line-clamp-2">{goal.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] font-mono-num text-text-3">
                      {goal.start_date && <span>Started: {goal.start_date}</span>}
                      {goal.target_date && (
                        <span className="text-highlight">Target: {goal.target_date}</span>
                      )}
                      <span className="capitalize">Status: {goal.status}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  {!isArchived && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(goal)}
                      className="text-xs text-text-2 hover:text-text gap-1 h-8"
                      aria-label={`Edit ${goal.title}`}
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
                      onClick={() => restoreGoalMut(goal.id)}
                      className="text-xs text-highlight hover:text-text gap-1 h-8"
                      aria-label={`Restore ${goal.title}`}
                    >
                      <ArchiveRestore className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => archiveGoalMut(goal.id)}
                      className="text-xs text-text-3 hover:text-danger gap-1 h-8"
                      aria-label={`Archive ${goal.title}`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteGoalMut(goal.id)}
                    className="h-8 w-8 text-text-3 hover:text-danger"
                    aria-label={`Delete ${goal.title}`}
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <GoalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        goal={editingGoal}
        domains={domains}
        onSave={handleSaveGoal}
        isSaving={isCreating || isUpdating}
      />
    </div>
  );
}
