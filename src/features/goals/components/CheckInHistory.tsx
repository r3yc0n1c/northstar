import { useState } from 'react';
import { ExternalLink, History, RotateCcw } from 'lucide-react';
import { Badge, Button, Skeleton } from '@/components/ui';
import type { KeyResult, KrCheckIn, RecordCheckInInput } from '../schema';
import { useKrCheckIns, useRecordCheckIn } from '../hooks/useCheckIns';
import { CheckInDialog } from './CheckInDialog';

interface CheckInHistoryProps {
  keyResult: KeyResult;
  workspaceId?: string;
}

export function CheckInHistory({ keyResult, workspaceId }: CheckInHistoryProps) {
  const [correctingCheckIn, setCorrectingCheckIn] = useState<KrCheckIn | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: checkIns = [], isLoading, error } = useKrCheckIns(keyResult.id);
  const { mutateAsync: recordMut, isPending: isRecording } = useRecordCheckIn(workspaceId);

  // Identify all check-in IDs that have been superseded by another check-in
  const supersededIds = new Set(
    checkIns
      .map((c) => c.supersedes_id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  );

  const handleOpenCorrection = (checkIn: KrCheckIn) => {
    setCorrectingCheckIn(checkIn);
    setIsDialogOpen(true);
  };

  const handleSaveCorrection = async (input: RecordCheckInInput) => {
    await recordMut(input);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <Skeleton className="h-10 w-full rounded-[6px]" />
        <Skeleton className="h-10 w-full rounded-[6px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-[8px] bg-danger/10 border border-danger/30 text-danger text-xs">
        Failed to load check-ins: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (checkIns.length === 0) {
    return (
      <div className="py-6 px-4 rounded-[8px] bg-surface-2/30 border border-dashed border-border/60 text-center flex flex-col items-center gap-1.5">
        <History className="w-5 h-5 text-text-3" />
        <p className="text-xs text-text-2">No check-ins recorded yet for this key result.</p>
        <span className="text-[11px] text-text-3">
          Record your first check-in to start tracking progress history.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-[8px] border border-border overflow-hidden bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2 text-text-2 border-b border-border text-[11px] font-mono-num uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Notes & Evidence</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text">
              {checkIns.map((item, index) => {
                const isSuperseded = supersededIds.has(item.id);
                const isCurrent = !isSuperseded && index === 0;

                return (
                  <tr
                    key={item.id}
                    data-testid={`checkin-row-${item.id}`}
                    className={`transition-colors ${
                      isSuperseded ? 'bg-surface-2/20 opacity-60' : 'hover:bg-surface-2/40'
                    }`}
                  >
                    {/* Date */}
                    <td className="py-2.5 px-3 font-mono-num text-text-2 whitespace-nowrap">
                      {item.recorded_at.slice(0, 10)}
                    </td>

                    {/* Value */}
                    <td className="py-2.5 px-3 font-mono-num font-semibold">
                      <span className={isSuperseded ? 'line-through text-text-3' : 'text-text'}>
                        {keyResult.metric_type === 'binary'
                          ? item.value >= 1
                            ? '1 (Done)'
                            : '0 (Not Done)'
                          : `${item.value}${keyResult.unit ? ` ${keyResult.unit}` : ''}`}
                      </span>
                    </td>

                    {/* Progress snapshot */}
                    <td className="py-2.5 px-3 font-mono-num text-highlight">
                      {item.progress_percent}%
                    </td>

                    {/* Confidence */}
                    <td className="py-2.5 px-3 font-mono-num">
                      {item.confidence ? `${item.confidence}/10` : '—'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3">
                      {isSuperseded ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono-num bg-warning/10 text-warning border-warning/30 px-1.5 py-0"
                        >
                          Corrected
                        </Badge>
                      ) : isCurrent ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono-num bg-success/15 text-success border-success/30 px-1.5 py-0"
                        >
                          Current
                        </Badge>
                      ) : (
                        <span className="font-mono-num text-text-3 text-[11px]">Historical</span>
                      )}
                    </td>

                    {/* Notes & Evidence */}
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="space-y-0.5">
                        {item.notes && (
                          <p className="text-text-2 truncate" title={item.notes}>
                            {item.notes}
                          </p>
                        )}
                        {item.evidence_url && (
                          <a
                            href={item.evidence_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-highlight hover:underline"
                          >
                            <span>Evidence</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {!item.notes && !item.evidence_url && (
                          <span className="text-text-3 italic">—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions: Correct */}
                    <td className="py-2.5 px-3 text-right">
                      {!isSuperseded && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenCorrection(item)}
                          className="h-7 text-xs text-text-2 hover:text-warning gap-1 px-2"
                          aria-label={`Correct check-in from ${item.recorded_at.slice(0, 10)}`}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Correct</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CheckInDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        keyResult={keyResult}
        supersedesCheckIn={correctingCheckIn}
        onSave={handleSaveCorrection}
        isSaving={isRecording}
      />
    </div>
  );
}
