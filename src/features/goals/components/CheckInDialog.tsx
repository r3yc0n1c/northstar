import { useEffect, useState } from 'react';
import { AlertCircle, History } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import {
  type KeyResult,
  type KrCheckIn,
  type RecordCheckInInput,
  recordCheckInSchema,
} from '../schema';

interface CheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  keyResult: KeyResult;
  supersedesCheckIn?: KrCheckIn | null;
  onSave: (input: RecordCheckInInput) => Promise<void>;
  isSaving: boolean;
}

export function CheckInDialog({
  isOpen,
  onClose,
  keyResult,
  supersedesCheckIn,
  onSave,
  isSaving,
}: CheckInDialogProps) {
  const [value, setValue] = useState<number>(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isBinary = keyResult.metric_type === 'binary';
  const isCorrection = Boolean(supersedesCheckIn);

  useEffect(() => {
    if (isOpen) {
      if (supersedesCheckIn) {
        setValue(Number(supersedesCheckIn.value));
        setConfidence(supersedesCheckIn.confidence ?? null);
        setNotes(
          supersedesCheckIn.notes
            ? `Correction: ${supersedesCheckIn.notes}`
            : 'Correction of previous entry',
        );
        setEvidenceUrl(supersedesCheckIn.evidence_url || '');
      } else {
        setValue(Number(keyResult.current_value));
        setConfidence(keyResult.confidence ?? 7);
        setNotes('');
        setEvidenceUrl('');
      }
      setError(null);
    }
  }, [isOpen, keyResult, supersedesCheckIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const candidatePayload = {
      key_result_id: keyResult.id,
      value: Number(value),
      confidence: confidence ?? null,
      notes,
      evidence_url: evidenceUrl.trim() ? evidenceUrl.trim() : null,
      supersedes_id: supersedesCheckIn?.id ?? null,
    };

    const result = recordCheckInSchema.safeParse(candidatePayload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid check-in input');
      return;
    }

    try {
      await onSave(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record check-in');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isCorrection ? 'Correct Check-In' : 'Record Progress Check-In'}
            </DialogTitle>
            <DialogDescription>{keyResult.title}</DialogDescription>
          </DialogHeader>

          {/* Correction Context Banner */}
          {isCorrection && supersedesCheckIn && (
            <div className="p-3 rounded-[8px] bg-warning/10 border border-warning/30 flex items-start gap-2.5 text-xs text-text">
              <History className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-warning">Correction Mode</span>
                <p className="text-text-2">
                  This new entry will supersede the previous check-in of{' '}
                  <span className="font-mono-num font-semibold text-text">
                    {supersedesCheckIn.value}
                    {keyResult.unit ? ` ${keyResult.unit}` : ''}
                  </span>{' '}
                  from {supersedesCheckIn.recorded_at.slice(0, 10)}. Both entries will remain in
                  history.
                </p>
              </div>
            </div>
          )}

          {/* Permanent append-only notice */}
          {!isCorrection && (
            <div className="p-2.5 rounded-[8px] bg-surface-2 border border-border/80 flex items-center gap-2 text-xs text-text-2">
              <AlertCircle className="w-4 h-4 text-highlight shrink-0" />
              <span>
                Check-ins are append-only and permanent. Historical entries are never deleted.
              </span>
            </div>
          )}

          {/* Value Input */}
          <div className="space-y-1.5">
            <Label htmlFor="checkin-value">
              {isBinary ? 'Completion Status' : 'New Current Value'}
            </Label>

            {isBinary ? (
              <Select value={String(value)} onValueChange={(val) => setValue(Number(val))}>
                <SelectTrigger id="checkin-value" aria-label="Completion Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (Incomplete / Not Done)</SelectItem>
                  <SelectItem value="1">1 (Complete / Done)</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="relative">
                <Input
                  id="checkin-value"
                  type="number"
                  step="any"
                  value={value}
                  onChange={(e) => {
                    setValue(Number(e.target.value));
                    if (error) setError(null);
                  }}
                  className="font-mono-num pr-16"
                  required
                  autoFocus
                />
                {keyResult.unit && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-3 font-mono-num pointer-events-none">
                    {keyResult.unit}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Confidence Rating */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="checkin-confidence">Confidence Rating</Label>
              <span className="font-mono-num text-xs text-highlight font-semibold">
                {confidence ? `${confidence}/10` : 'Uncalibrated'}
              </span>
            </div>
            <Select
              value={confidence ? String(confidence) : 'none'}
              onValueChange={(val) => setConfidence(val === 'none' ? null : Number(val))}
            >
              <SelectTrigger id="checkin-confidence" aria-label="Confidence Rating">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncalibrated</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num}/10
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="checkin-notes">Notes / Context (optional)</Label>
            <Textarea
              id="checkin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What drove this progress change or what was learned..."
              rows={2}
              maxLength={1000}
              className="resize-none font-sans"
            />
          </div>

          {/* Evidence URL */}
          <div className="space-y-1.5">
            <Label htmlFor="checkin-evidence">Evidence URL (optional)</Label>
            <Input
              id="checkin-evidence"
              type="url"
              value={evidenceUrl}
              onChange={(e) => {
                setEvidenceUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://dashboard.example.com/metrics"
            />
          </div>

          {error && <p className="text-xs text-danger font-medium">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Recording...' : isCorrection ? 'Record Correction' : 'Record Check-In'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
