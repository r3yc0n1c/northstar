import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  ArchiveRestore,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
  ExternalLink,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { Badge, Button, ProgressBar, Skeleton, StatusBadge } from '@/components/ui';
import { krHealth, krProgress, objectiveProgress } from '@/domain/kr';
import type {
  CreateKeyResultInput,
  Goal,
  KeyResult,
  Objective,
  ObjectivePriority,
  ObjectiveStatus,
} from '../schema';
import { OBJECTIVE_PRIORITY_BADGES, OBJECTIVE_STATUS_BADGES } from '../schema';
import {
  useArchiveKeyResult,
  useCreateKeyResult,
  useDeleteKeyResult,
  useKeyResults,
  useRestoreKeyResult,
  useUpdateKeyResult,
} from '../hooks/useKeyResults';
import { useRecordCheckIn } from '../hooks/useCheckIns';
import { KeyResultDialog } from './KeyResultDialog';
import { CheckInDialog } from './CheckInDialog';

interface ObjectiveCardProps {
  objective: Objective;
  workspaceId?: string;
  parentGoal?: Goal | null;
  showArchived: boolean;
  onEdit: (obj: Objective) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ObjectiveCard({
  objective,
  workspaceId,
  parentGoal,
  showArchived,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: ObjectiveCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isKrDialogOpen, setIsKrDialogOpen] = useState(false);
  const [editingKr, setEditingKr] = useState<KeyResult | null>(null);
  const [checkingInKr, setCheckingInKr] = useState<KeyResult | null>(null);

  const { data: keyResults = [], isLoading: isLoadingKrs } = useKeyResults(workspaceId, {
    objectiveId: objective.id,
    includeArchived: showArchived,
  });

  const { mutateAsync: createKrMut, isPending: isCreatingKr } = useCreateKeyResult(workspaceId);
  const { mutateAsync: updateKrMut, isPending: isUpdatingKr } = useUpdateKeyResult(workspaceId);
  const { mutateAsync: archiveKrMut } = useArchiveKeyResult(workspaceId);
  const { mutateAsync: restoreKrMut } = useRestoreKeyResult(workspaceId);
  const { mutateAsync: deleteKrMut } = useDeleteKeyResult(workspaceId);
  const { mutateAsync: recordCheckInMut, isPending: isRecordingCheckIn } =
    useRecordCheckIn(workspaceId);

  const isArchived = Boolean(objective.archived_at);
  const statusBadge = OBJECTIVE_STATUS_BADGES[(objective.status as ObjectiveStatus) || 'draft'];
  const priorityBadge =
    OBJECTIVE_PRIORITY_BADGES[(objective.priority as ObjectivePriority) || 'none'];

  const today = new Date().toISOString().slice(0, 10);

  // Compute progress for each KR and aggregate for the objective
  const activeKrs = keyResults.filter((kr) => !kr.archived_at);
  const krProgressValues = activeKrs.map((kr) => {
    try {
      return krProgress({
        baseline: Number(kr.baseline_value),
        current: Number(kr.current_value),
        target: Number(kr.target_value),
        direction: kr.direction,
        metricType: kr.metric_type,
      }).displayed;
    } catch {
      return 0;
    }
  });

  const objProgress = objectiveProgress(krProgressValues);
  const objHealth =
    objProgress !== null
      ? krHealth({
          progress: objProgress,
          startDate: objective.start_date,
          dueDate: objective.due_date,
          today,
        })
      : null;

  const handleOpenCreateKr = () => {
    setEditingKr(null);
    setIsKrDialogOpen(true);
  };

  const handleOpenEditKr = (kr: KeyResult) => {
    setEditingKr(kr);
    setIsKrDialogOpen(true);
  };

  const handleSaveKr = async (input: CreateKeyResultInput) => {
    if (editingKr) {
      await updateKrMut({ keyResultId: editingKr.id, input });
    } else {
      await createKrMut(input);
    }
  };

  return (
    <article
      data-testid={`objective-item-${objective.id}`}
      className={`p-4 rounded-[10px] border transition-colors flex flex-col gap-3 ${
        isArchived
          ? 'bg-surface/40 border-border/60 opacity-60'
          : 'bg-surface border-border hover:border-border/90'
      }`}
    >
      {/* Header row: Title, badges, dates, and actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-9 h-9 rounded-[8px] bg-surface-2 border border-border flex items-center justify-center text-highlight shrink-0 mt-0.5 hover:bg-surface transition-colors"
            aria-label={isExpanded ? 'Collapse key results' : 'Expand key results'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/goals/objectives/${objective.id}`}
                className="text-sm font-semibold text-text truncate hover:text-highlight transition-colors flex items-center gap-1.5 group"
              >
                <span>{objective.title}</span>
                <ExternalLink className="w-3 h-3 text-text-3 group-hover:text-highlight transition-colors shrink-0" />
              </Link>

              <Badge
                variant="secondary"
                className={`text-[10px] font-mono-num font-medium border px-1.5 py-0.2 ${statusBadge.className}`}
              >
                {statusBadge.label}
              </Badge>

              {objective.priority !== 'none' && (
                <Badge
                  variant="secondary"
                  className={`text-[10px] font-mono-num font-medium border px-1.5 py-0.2 ${priorityBadge.className}`}
                >
                  {priorityBadge.label}
                </Badge>
              )}

              {/* Three separate displays: Confidence, Progress, and Health */}
              {objective.confidence !== null && objective.confidence !== undefined && (
                <span className="font-mono-num text-[11px] px-1.5 py-0.2 rounded bg-surface-2 text-highlight border border-border">
                  Conf: {objective.confidence}/10
                </span>
              )}

              {objHealth && <StatusBadge status={objHealth} />}

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

            {objective.description && (
              <p className="text-xs text-text-2 line-clamp-2">{objective.description}</p>
            )}

            <div className="flex items-center gap-4 pt-0.5 text-[11px] font-mono-num text-text-3">
              <span>
                {objective.start_date} – {objective.due_date}
              </span>
              <span>·</span>
              <span className="text-text-2">
                {activeKrs.length} {activeKrs.length === 1 ? 'Key Result' : 'Key Results'}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
          {!isArchived && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleOpenCreateKr}
              className="text-xs gap-1 h-8"
              aria-label={`Add Key Result to ${objective.title}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add KR</span>
            </Button>
          )}

          {!isArchived && (
            <Link
              to={`/goals/objectives/${objective.id}`}
              className="inline-flex items-center justify-center h-8 px-2.5 rounded-[6px] text-xs font-medium text-text-2 hover:text-text hover:bg-surface-2 border border-border/40 transition-colors gap-1"
              aria-label={`View details for ${objective.title}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Details</span>
            </Link>
          )}

          {!isArchived && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(objective)}
              className="text-xs text-text-2 hover:text-text gap-1 h-8"
              aria-label={`Edit ${objective.title}`}
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
              onClick={() => onRestore(objective.id)}
              className="text-xs text-highlight hover:text-text gap-1 h-8"
              aria-label={`Restore ${objective.title}`}
            >
              <ArchiveRestore className="w-3.5 h-3.5" />
              <span>Restore</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onArchive(objective.id)}
              className="text-xs text-text-3 hover:text-danger gap-1 h-8"
              aria-label={`Archive ${objective.title}`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(objective.id)}
            className="h-8 w-8 text-text-3 hover:text-danger"
            aria-label={`Delete ${objective.title}`}
            title="Delete objective"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Aggregate Objective Progress Bar (when KRs exist) */}
      {objProgress !== null ? (
        <div className="mt-1 pt-2 border-t border-border/40">
          <ProgressBar
            value={objProgress}
            label="Objective Aggregate Progress"
            className="text-xs"
          />
        </div>
      ) : (
        <div className="mt-1 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-text-3 italic">
          <span>No key results yet</span>
          <span className="font-mono-num text-[11px] not-italic text-text-3">Unestimated</span>
        </div>
      )}

      {/* Expandable Key Results Section */}
      {isExpanded && (
        <div
          className="mt-2 space-y-2 pt-2 border-t border-border/40"
          data-testid={`kr-list-${objective.id}`}
        >
          {isLoadingKrs && (
            <div className="space-y-2 py-1">
              <Skeleton className="h-14 w-full rounded-[8px]" />
              <Skeleton className="h-14 w-full rounded-[8px]" />
            </div>
          )}

          {!isLoadingKrs && keyResults.length === 0 && (
            <div className="py-4 px-3 rounded-[8px] bg-surface-2/30 border border-dashed border-border/60 text-center flex flex-col items-center gap-2">
              <Target className="w-5 h-5 text-text-3" />
              <p className="text-xs text-text-2">
                No key results defined. Add quantifiable metrics to measure progress.
              </p>
              {!isArchived && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenCreateKr}
                  className="gap-1.5 h-7 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add First Key Result</span>
                </Button>
              )}
            </div>
          )}

          {!isLoadingKrs &&
            keyResults.map((kr) => {
              const isKrArchived = Boolean(kr.archived_at);
              let progressData = { raw: 0, displayed: 0 };
              try {
                progressData = krProgress({
                  baseline: Number(kr.baseline_value),
                  current: Number(kr.current_value),
                  target: Number(kr.target_value),
                  direction: kr.direction,
                  metricType: kr.metric_type,
                });
              } catch {
                // Keep fallback 0
              }

              const krHealthStatus = krHealth({
                progress: progressData.displayed,
                startDate: kr.start_date,
                dueDate: kr.due_date,
                today,
              });

              return (
                <div
                  key={kr.id}
                  data-testid={`kr-item-${kr.id}`}
                  className={`p-3 rounded-[8px] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isKrArchived
                      ? 'bg-surface-2/30 border-border/40 opacity-60'
                      : 'bg-surface-2/50 border-border/70 hover:border-border'
                  }`}
                >
                  {/* KR Title, metric type and values */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-text truncate">{kr.title}</span>

                      <Badge
                        variant="secondary"
                        className="text-[10px] font-mono-num font-medium bg-surface text-text-2 border-border/60 px-1.5 py-0"
                      >
                        {kr.metric_type === 'binary'
                          ? 'Binary'
                          : kr.direction === 'increase'
                            ? 'Numeric ↑'
                            : 'Numeric ↓'}
                      </Badge>

                      <StatusBadge status={krHealthStatus} />

                      {kr.confidence !== null && kr.confidence !== undefined && (
                        <span className="font-mono-num text-[10px] px-1.5 py-0 rounded bg-surface text-highlight border border-border">
                          {kr.confidence}/10
                        </span>
                      )}

                      {isKrArchived && (
                        <span className="font-mono-num text-[9px] uppercase px-1 py-0 rounded bg-surface text-warning border border-border">
                          Archived
                        </span>
                      )}
                    </div>

                    {/* Baseline -> Current / Target display */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-2">
                      <span className="font-mono-num">
                        {kr.metric_type === 'binary' ? (
                          kr.current_value >= 1 ? (
                            '1 / 1 (Done)'
                          ) : (
                            '0 / 1 (Incomplete)'
                          )
                        ) : (
                          <>
                            {kr.currency_code ? `${kr.currency_code} ` : ''}
                            <span className="text-text-3">{kr.baseline_value}</span>
                            {' → '}
                            <span className="font-semibold text-text">{kr.current_value}</span>
                            {' / '}
                            <span className="text-text">{kr.target_value}</span>
                            {kr.unit ? ` ${kr.unit}` : ''}
                          </>
                        )}
                      </span>

                      <span className="text-text-3 font-mono-num text-[11px]">
                        ({kr.start_date} – {kr.due_date})
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="pt-0.5 max-w-md">
                      <ProgressBar
                        value={progressData.displayed}
                        showValue={true}
                        className="text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Actions for this KR */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    {!isKrArchived && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCheckingInKr(kr)}
                        className="text-xs gap-1 h-7 px-2 font-medium"
                        aria-label={`Check in on ${kr.title}`}
                      >
                        <CheckCircle className="w-3 h-3 text-highlight" />
                        <span>Check In</span>
                      </Button>
                    )}

                    {!isKrArchived && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditKr(kr)}
                        className="text-xs text-text-2 hover:text-text h-7 px-2"
                        aria-label={`Edit ${kr.title}`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}

                    {isKrArchived ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreKrMut(kr.id)}
                        className="text-xs text-highlight hover:text-text h-7 px-2"
                        aria-label={`Restore ${kr.title}`}
                      >
                        <ArchiveRestore className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => archiveKrMut(kr.id)}
                        className="text-xs text-text-3 hover:text-danger h-7 px-2"
                        aria-label={`Archive ${kr.title}`}
                      >
                        <Archive className="w-3 h-3" />
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteKrMut(kr.id)}
                      className="h-7 w-7 text-text-3 hover:text-danger"
                      aria-label={`Delete ${kr.title}`}
                      title="Delete key result"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <KeyResultDialog
        isOpen={isKrDialogOpen}
        onClose={() => setIsKrDialogOpen(false)}
        keyResult={editingKr}
        objective={objective}
        onSave={handleSaveKr}
        isSaving={isCreatingKr || isUpdatingKr}
      />

      {checkingInKr && (
        <CheckInDialog
          isOpen={Boolean(checkingInKr)}
          onClose={() => setCheckingInKr(null)}
          keyResult={checkingInKr}
          onSave={async (input) => {
            await recordCheckInMut(input);
          }}
          isSaving={isRecordingCheckIn}
        />
      )}
    </article>
  );
}
