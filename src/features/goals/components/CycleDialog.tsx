import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
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
} from '@/components/ui';
import { generateQuarterlyCycles } from '@/domain/cycles';
import {
  type CreateCycleInput,
  type Cycle,
  type CycleStatus,
  type CycleType,
  createCycleSchema,
} from '../schema';

interface CycleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cycle?: Cycle | null;
  onSave: (input: CreateCycleInput) => Promise<void>;
  isSaving: boolean;
}

export function CycleDialog({ isOpen, onClose, cycle, onSave, isSaving }: CycleDialogProps) {
  const [name, setName] = useState('');
  const [cycleType, setCycleType] = useState<CycleType>('quarterly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<CycleStatus>('planned');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (cycle) {
        setName(cycle.name);
        setCycleType(cycle.cycle_type as CycleType);
        setStartDate(cycle.start_date);
        setEndDate(cycle.end_date);
        setStatus(cycle.status as CycleStatus);
      } else {
        setName('');
        setCycleType('quarterly');
        setStartDate('');
        setEndDate('');
        setStatus('planned');
      }
      setError(null);
    }
  }, [isOpen, cycle]);

  const handleAutofillQuarter = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentQuarter = Math.ceil(currentMonth / 3); // 1-4
    const quarters = generateQuarterlyCycles(currentYear);
    const q = quarters[currentQuarter - 1];
    if (q) {
      setName(q.name);
      setCycleType('quarterly');
      setStartDate(q.start_date);
      setEndDate(q.end_date);
      setStatus('active');
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = createCycleSchema.safeParse({
      name,
      cycle_type: cycleType,
      start_date: startDate,
      end_date: endDate,
      status,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid cycle input');
      return;
    }

    try {
      await onSave(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cycle');
    }
  };

  const isEditing = Boolean(cycle);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{isEditing ? 'Edit Planning Cycle' : 'New Planning Cycle'}</DialogTitle>
              {!isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutofillQuarter}
                  className="text-xs text-highlight hover:text-highlight gap-1.5 h-7"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Autofill Current Quarter</span>
                </Button>
              )}
            </div>
            <DialogDescription>
              Time-bound cadence (quarterly, monthly, annual) that anchors objectives and key
              results.
            </DialogDescription>
          </DialogHeader>

          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="cycle-name">Cycle Name</Label>
            <Input
              id="cycle-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Q4 2026, November 2026, 2027 Annual"
              maxLength={60}
              autoFocus
            />
          </div>

          {/* Cycle Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cycle-type">Cycle Type</Label>
              <Select value={cycleType} onValueChange={(val) => setCycleType(val as CycleType)}>
                <SelectTrigger id="cycle-type" aria-label="Cycle Type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cycle-status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as CycleStatus)}>
                <SelectTrigger id="cycle-status" aria-label="Status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cycle-start-date">Start Date</Label>
              <Input
                id="cycle-start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (error) setError(null);
                }}
                className="font-mono-num text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cycle-end-date">End Date</Label>
              <Input
                id="cycle-end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (error) setError(null);
                }}
                className="font-mono-num text-xs"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Cycle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
