import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Compass,
  Edit2,
  FileText,
  Folder,
  History,
  Plus,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Badge, Button, ErrorState, ProgressBar, Skeleton, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { getCycleDurationDays } from '@/domain/cycles';
import { krHealth, krProgress, objectiveProgress } from '@/domain/kr';
import {
  OBJECTIVE_PRIORITY_BADGES,
  OBJECTIVE_STATUS_BADGES,
  type CreateKeyResultInput,
  type CreateObjectiveInput,
  type KeyResult,
  type ObjectivePriority,
  type ObjectiveStatus,
  type RecordCheckInInput,
} from '../schema';
import { useCurrentWorkspace } from '../hooks/useWorkspace';
import { useObjectiveDetail, useUpdateObjective } from '../hooks/useObjectives';
import { useCycles } from '../hooks/useCycles';
import { useGoals } from '../hooks/useGoals';
import { useDomains } from '../hooks/useDomains';
import { useCreateKeyResult, useKeyResults, useUpdateKeyResult } from '../hooks/useKeyResults';
import { useKrCheckIns, useRecordCheckIn } from '../hooks/useCheckIns';
import { ObjectiveDialog } from './ObjectiveDialog';
import { KeyResultDialog } from './KeyResultDialog';
import { CheckInDialog } from './CheckInDialog';
import { CheckInHistory } from './CheckInHistory';
import { ProgressChart } from './ProgressChart';

export function ObjectiveDetailPage() {
  const { id: objectiveId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: workspace, isLoading: isWsLoading, error: wsError } = useCurrentWorkspace();

  const {
    data: objective,
    isLoading: isObjLoading,
    error: objError,
    refetch: refetchObjective,
  } = useObjectiveDetail(objectiveId);

  const { data: cycles = [] } = useCycles(workspace?.id);
  const { data: goals = [] } = useGoals(workspace?.id, { includeArchived: true });
  const { data: domains = [] } = useDomains(workspace?.id, true);
  const { data: keyResults = [], isLoading: isKrsLoading } = useKeyResults(
    workspace?.id,
    objectiveId ? { objectiveId } : undefined,
  );

  const { mutateAsync: updateObjectiveMut, isPending: isUpdatingObjective } = useUpdateObjective(
    workspace?.id,
  );
  const { mutateAsync: createKrMut, isPending: isCreatingKr } = useCreateKeyResult(workspace?.id);
  const { mutateAsync: updateKrMut, isPending: isUpdatingKr } = useUpdateKeyResult(workspace?.id);
  const { mutateAsync: recordCheckInMut, isPending: isRecordingCheckIn } = useRecordCheckIn(
    workspace?.id,
  );

  // Active Key Result selection for Telemetry Chart and Check-in History
  const [selectedKrId, setSelectedKrId] = useState<string | null>(null);

  // Dialog states
  const [isEditObjectiveOpen, setIsEditObjectiveOpen] = useState(false);
  const [isKrDialogOpen, setIsKrDialogOpen] = useState(false);
  const [editingKr, setEditingKr] = useState<KeyResult | null>(null);
  const [checkingInKr, setCheckingInKr] = useState<KeyResult | null>(null);

  const activeKrs = keyResults.filter((kr) => !kr.archived_at);

  // Sync selected KR
  const selectedKr = activeKrs.find((kr) => kr.id === selectedKrId) ?? activeKrs[0] ?? null;

  const { data: selectedKrCheckIns = [] } = useKrCheckIns(selectedKr?.id);

  if (isWsLoading || isObjLoading || isKrsLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-14 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (wsError || objError || !objective || !workspace) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <ErrorState
          title="Failed to load objective"
          message={
            objError instanceof Error
              ? objError.message
              : 'Objective not found or workspace could not be loaded.'
          }
          onRetry={() => navigate('/goals?tab=okrs')}
          retryLabel="Back to OKRs"
        />
      </div>
    );
  }

  const cycle = cycles.find((c) => c.id === objective.cycle_id);
  const parentGoal = goals.find((g) => g.id === objective.goal_id);
  const parentDomain = parentGoal?.domain_id
    ? domains.find((d) => d.id === parentGoal.domain_id)
    : null;

  const today = new Date().toISOString().slice(0, 10);

  // Calculate displayed progress for each active KR
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

  // Calculate aggregate objective progress and health
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

  // Time remaining calculation
  const totalDays = getCycleDurationDays(objective.start_date, objective.due_date);
  let timeRemainingLabel = '';
  let timeRemainingSub = '';
  if (today < objective.start_date) {
    const daysUntilStart = getCycleDurationDays(today, objective.start_date) - 1;
    timeRemainingLabel = `Starts in ${daysUntilStart}d`;
    timeRemainingSub = `Starts on ${formatDate(objective.start_date)}`;
  } else if (today > objective.due_date) {
    const daysOverdue = getCycleDurationDays(objective.due_date, today) - 1;
    timeRemainingLabel = 'Cycle ended';
    timeRemainingSub = `Ended ${daysOverdue}d ago`;
  } else {
    const daysLeft = getCycleDurationDays(today, objective.due_date) - 1;
    const elapsedDays = totalDays - daysLeft;
    const elapsedPercent =
      totalDays > 0 ? Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100))) : 100;
    timeRemainingLabel = `${daysLeft} days`;
    timeRemainingSub = `Ends ${formatDate(objective.due_date)} (${elapsedPercent}% lapsed)`;
  }

  const statusBadge = OBJECTIVE_STATUS_BADGES[(objective.status as ObjectiveStatus) || 'draft'];
  const priorityBadge =
    OBJECTIVE_PRIORITY_BADGES[(objective.priority as ObjectivePriority) || 'none'];

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

  const handleSaveObjective = async (input: CreateObjectiveInput) => {
    await updateObjectiveMut({ objectiveId: objective.id, input });
    await refetchObjective();
  };

  const handleSaveCheckIn = async (input: RecordCheckInInput) => {
    await recordCheckInMut(input);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & context trace */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-mono-num text-text-2"
      >
        <Link
          to="/goals?tab=okrs"
          className="hover:text-highlight transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to OKRs</span>
        </Link>
        <span className="text-border">/</span>
        <span className="text-text-3">{cycle ? cycle.name : 'Cycle'}</span>
        <span className="text-border">/</span>
        <span aria-current="page" className="text-text font-medium truncate max-w-xs sm:max-w-md">
          {objective.title}
        </span>
      </nav>

      {/* Objective header zone */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
              {objective.title}
            </h1>

            {/* Badges */}
            <Badge
              variant="secondary"
              className={`text-[10px] font-mono-num font-medium border px-2 py-0.5 ${statusBadge.className}`}
            >
              {statusBadge.label}
            </Badge>

            {objective.priority !== 'none' && (
              <Badge
                variant="secondary"
                className={`text-[10px] font-mono-num font-medium border px-2 py-0.5 ${priorityBadge.className}`}
              >
                {priorityBadge.label}
              </Badge>
            )}

            {parentDomain && (
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] border text-xs"
                style={{
                  backgroundColor: `${parentDomain.color}15`,
                  borderColor: `${parentDomain.color}35`,
                  color: parentDomain.color,
                }}
              >
                <Compass className="w-3 h-3" />
                <span>{parentDomain.name}</span>
              </div>
            )}

            {cycle && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-surface-2 border border-border text-xs font-mono-num text-text-2">
                {cycle.name}
              </span>
            )}
          </div>

          {objective.description && (
            <p className="text-sm text-text-2 max-w-3xl leading-relaxed">{objective.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditObjectiveOpen(true)}
            className="text-xs gap-1.5 h-9"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreateKr}
            className="text-xs gap-1.5 h-9 bg-accent hover:bg-accent-hover text-text"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add key result</span>
          </Button>
        </div>
      </header>

      {/* Top summary strip: 4 segments */}
      <section
        data-testid="summary-strip"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-surface border border-border rounded-[10px] overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border/60"
      >
        {/* Cell 1: Progress */}
        <div className="p-4 flex flex-col justify-between gap-2 bg-surface/60 hover:bg-surface-2/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono-num uppercase tracking-wider text-text-3">Progress</span>
            <span className="font-mono-num text-text-3">Aggr. Weight</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-bold font-mono-num text-text">
              {objProgress !== null ? `${objProgress}%` : '—'}
            </span>
          </div>
          <div className="w-full">
            {objProgress !== null ? (
              <ProgressBar value={objProgress} className="h-1.5" />
            ) : (
              <span className="text-[11px] text-text-3">No key results yet</span>
            )}
          </div>
        </div>

        {/* Cell 2: Health */}
        <div className="p-4 flex flex-col justify-between gap-2 bg-surface/60 hover:bg-surface-2/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono-num uppercase tracking-wider text-text-3">Health</span>
            <span className="font-mono-num text-text-3">Derived</span>
          </div>
          <div className="my-1">
            {objHealth ? (
              <StatusBadge status={objHealth} />
            ) : (
              <span className="text-xs font-mono-num text-text-3">Pending KRs</span>
            )}
          </div>
          <span className="text-[11px] text-text-2 truncate">
            {objHealth === 'on_track' && 'Velocity aligns with target trajectory'}
            {objHealth === 'at_risk' && 'Velocity behind target trajectory'}
            {objHealth === 'off_track' && 'Significant gap to expected velocity'}
            {objHealth === 'achieved' && 'Target outcome achieved'}
            {objHealth === 'not_started' && 'Cycle starts in the future'}
            {!objHealth && 'Add KRs to calculate derived health'}
          </span>
        </div>

        {/* Cell 3: Confidence */}
        <div className="p-4 flex flex-col justify-between gap-2 bg-surface/60 hover:bg-surface-2/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono-num uppercase tracking-wider text-text-3">Confidence</span>
            <span className="font-mono-num text-text-3">Self-assessment</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-bold font-mono-num text-text">
              {objective.confidence ?? '—'}
            </span>
            {objective.confidence !== null && objective.confidence !== undefined && (
              <span className="text-sm font-mono-num text-text-3">/ 10</span>
            )}
          </div>
          <span className="text-[11px] text-text-2">
            {typeof objective.confidence === 'number' &&
              objective.confidence >= 8 &&
              'High certainty in target'}
            {typeof objective.confidence === 'number' &&
              objective.confidence >= 5 &&
              objective.confidence < 8 &&
              'Achievable with focus'}
            {typeof objective.confidence === 'number' &&
              objective.confidence < 5 &&
              'High risk of shortfall'}
            {(objective.confidence === null || objective.confidence === undefined) &&
              'Self-rating not recorded'}
          </span>
        </div>

        {/* Cell 4: Time Remaining */}
        <div className="p-4 flex flex-col justify-between gap-2 bg-surface/60 hover:bg-surface-2/40 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono-num uppercase tracking-wider text-text-3">Time Left</span>
            <span className="font-mono-num text-text-3">Window</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-bold font-mono-num text-text">{timeRemainingLabel}</span>
          </div>
          <span className="text-[11px] text-text-2 truncate">{timeRemainingSub}</span>
        </div>
      </section>

      {/* Main two-column architectural workbench */}
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
        {/* Left domain: Key Results, Telemetry Chart, Check-in audit log */}
        <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
          {/* Section: Key Results */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-highlight" />
                <h2 className="text-base font-semibold text-text">Key results</h2>
                <span className="px-2 py-0.5 rounded bg-surface-2 border border-border text-xs font-mono-num text-text-2">
                  {activeKrs.length} Active
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleOpenCreateKr}
                className="text-xs text-highlight hover:text-text gap-1 h-7"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add KR</span>
              </Button>
            </div>

            {activeKrs.length === 0 ? (
              <div className="p-8 rounded-[10px] bg-surface border border-dashed border-border/80 flex flex-col items-center justify-center text-center gap-2">
                <Target className="w-8 h-8 text-text-3" />
                <h3 className="text-sm font-semibold text-text">No key results yet</h3>
                <p className="text-xs text-text-2 max-w-sm">
                  Add measurable numeric or binary key results to track outcomes toward this
                  objective.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreateKr}
                  className="mt-2 text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Key Result</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeKrs.map((kr, idx) => {
                  let progress = 0;
                  try {
                    progress = krProgress({
                      baseline: Number(kr.baseline_value),
                      current: Number(kr.current_value),
                      target: Number(kr.target_value),
                      direction: kr.direction,
                      metricType: kr.metric_type,
                    }).displayed;
                  } catch {
                    progress = 0;
                  }

                  const health = krHealth({
                    progress,
                    startDate: kr.start_date,
                    dueDate: kr.due_date,
                    today,
                  });

                  const isSelected = selectedKr?.id === kr.id;

                  return (
                    <article
                      key={kr.id}
                      className={`p-3.5 rounded-[10px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-surface-2/70 border-highlight ring-1 ring-highlight/40'
                          : 'bg-surface border-border hover:border-border/80'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedKrId(kr.id)}
                        className="text-left flex items-start gap-3 flex-1 min-w-0 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-highlight rounded-[6px]"
                      >
                        <span
                          className={`mt-1.5 flex h-2 w-2 rounded-full shrink-0 ${
                            isSelected ? 'bg-highlight ring-4 ring-highlight/20' : 'bg-text-3'
                          }`}
                        />
                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono-num text-text-3">KR {idx + 1}:</span>
                            <h3 className="text-sm font-medium text-text group-hover:text-highlight transition-colors truncate">
                              {kr.title}
                            </h3>
                            <StatusBadge status={health} />
                          </div>

                          {/* Progress bar & readout */}
                          <div className="flex items-center gap-3 max-w-md w-full">
                            <div className="flex-1">
                              <ProgressBar value={progress} className="h-1.5" />
                            </div>
                            <span className="font-mono-num text-xs text-text font-semibold shrink-0">
                              {kr.current_value}{' '}
                              <span className="text-text-3 font-normal">
                                / {kr.target_value} {kr.unit || ''}
                              </span>
                            </span>
                            <span className="font-mono-num text-xs text-text-2 shrink-0">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setCheckingInKr(kr)}
                          className="h-8 px-2.5 text-xs gap-1 border-border hover:bg-surface-2"
                        >
                          <Calendar className="w-3.5 h-3.5 text-highlight" />
                          <span>Check in</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditKr(kr)}
                          className="h-8 px-2 text-xs text-text-2 hover:text-text"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section: Progress telemetry chart */}
          {selectedKr && (
            <section className="bg-surface border border-border rounded-[10px] p-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-highlight" />
                  <h2 className="text-base font-semibold text-text">Progress telemetry</h2>
                </div>

                {/* Tab selector for switching KR */}
                {activeKrs.length > 1 && (
                  <div className="flex items-center gap-1 p-0.5 rounded-[6px] bg-surface-2 border border-border text-xs font-mono-num overflow-x-auto max-w-full">
                    {activeKrs.map((kr, idx) => (
                      <button
                        key={kr.id}
                        type="button"
                        onClick={() => setSelectedKrId(kr.id)}
                        className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors whitespace-nowrap ${
                          selectedKr.id === kr.id
                            ? 'bg-accent text-text'
                            : 'text-text-2 hover:text-text'
                        }`}
                      >
                        KR{idx + 1}: {kr.title.slice(0, 14)}...
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ProgressChart keyResult={selectedKr} checkIns={selectedKrCheckIns} />
            </section>
          )}

          {/* Section: Check-in history table */}
          {selectedKr && (
            <section className="bg-surface border border-border rounded-[10px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-highlight" />
                    <h2 className="text-base font-semibold text-text">Check-in history</h2>
                  </div>
                  <p className="text-xs text-text-2 mt-0.5">
                    Permanent immutable log for{' '}
                    <span className="font-semibold text-text">{selectedKr.title}</span>. Corrections
                    append superseding entries.
                  </p>
                </div>
              </div>

              <div className="p-4">
                <CheckInHistory keyResult={selectedKr} workspaceId={workspace.id} />
              </div>
            </section>
          )}
        </div>

        {/* Right domain: Context panels & linked entities */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          {/* Card: Linked projects (Phase 3 placeholder) */}
          <section className="p-4 rounded-[10px] bg-surface border border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-highlight" />
                <h2 className="text-sm font-semibold text-text">Linked projects</h2>
              </div>
              <span className="font-mono-num text-[11px] px-1.5 py-0.5 rounded bg-surface-2 text-text-3 border border-border">
                0 linked
              </span>
            </div>

            <div className="py-6 px-4 rounded-[8px] bg-surface-2/30 border border-dashed border-border/60 text-center flex flex-col items-center gap-2">
              <Folder className="w-6 h-6 text-text-3" />
              <p className="text-xs text-text-2">
                Projects can be linked to this objective in Phase 3.
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled
              className="w-full text-xs text-text-3 cursor-not-allowed border-dashed"
            >
              Link project (Phase 3)
            </Button>
          </section>

          {/* Card: Strategic notes & objective window */}
          <section className="p-4 rounded-[10px] bg-surface border border-border flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-highlight" />
                <h2 className="text-sm font-semibold text-text">Strategic context</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditObjectiveOpen(true)}
                className="h-6 w-6 p-0 text-text-3 hover:text-text"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-3 text-xs text-text-2">
              {objective.description ? (
                <p className="leading-relaxed whitespace-pre-wrap">{objective.description}</p>
              ) : (
                <p className="italic text-text-3">No strategic notes provided.</p>
              )}

              <div className="border-t border-border/40 pt-3 space-y-2 font-mono-num text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-3">Cycle:</span>
                  <span className="text-text">{cycle ? cycle.name : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Window:</span>
                  <span className="text-text">
                    {objective.start_date} – {objective.due_date}
                  </span>
                </div>
                {parentGoal && (
                  <div className="flex justify-between">
                    <span className="text-text-3">Goal:</span>
                    <span className="text-text truncate max-w-[160px]">{parentGoal.title}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Edit Objective Dialog */}
      <ObjectiveDialog
        isOpen={isEditObjectiveOpen}
        onClose={() => setIsEditObjectiveOpen(false)}
        cycles={cycles}
        goals={goals}
        objective={objective}
        defaultCycleId={objective.cycle_id}
        onSave={handleSaveObjective}
        isSaving={isUpdatingObjective}
      />

      {/* Create / Edit Key Result Dialog */}
      <KeyResultDialog
        isOpen={isKrDialogOpen}
        onClose={() => {
          setIsKrDialogOpen(false);
          setEditingKr(null);
        }}
        objective={objective}
        keyResult={editingKr}
        onSave={handleSaveKr}
        isSaving={isCreatingKr || isUpdatingKr}
      />

      {/* Check In Dialog */}
      {checkingInKr && (
        <CheckInDialog
          isOpen={Boolean(checkingInKr)}
          onClose={() => setCheckingInKr(null)}
          keyResult={checkingInKr}
          onSave={handleSaveCheckIn}
          isSaving={isRecordingCheckIn}
        />
      )}
    </div>
  );
}
