import { useEffect, useState } from 'react';
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
  type CreateObjectiveInput,
  type Cycle,
  type Goal,
  type Objective,
  type ObjectivePriority,
  type ObjectiveStatus,
  createObjectiveSchema,
} from '../schema';

interface ObjectiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  objective?: Objective | null;
  cycles: Cycle[];
  goals: Goal[];
  defaultCycleId?: string;
  onSave: (input: CreateObjectiveInput) => Promise<void>;
  isSaving: boolean;
}

export function ObjectiveDialog({
  isOpen,
  onClose,
  objective,
  cycles,
  goals,
  defaultCycleId,
  onSave,
  isSaving,
}: ObjectiveDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cycleId, setCycleId] = useState<string>('');
  const [goalId, setGoalId] = useState<string>('none');
  const [status, setStatus] = useState<ObjectiveStatus>('active');
  const [priority, setPriority] = useState<ObjectivePriority>('none');
  const [confidence, setConfidence] = useState<number | null>(7);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  // When cycle changes, update default start and due dates if creating a new objective
  const handleCycleChange = (newCycleId: string) => {
    setCycleId(newCycleId);
    if (!objective) {
      const selectedCycle = cycles.find((c) => c.id === newCycleId);
      if (selectedCycle) {
        setStartDate(selectedCycle.start_date);
        setDueDate(selectedCycle.end_date);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (objective) {
        setTitle(objective.title);
        setDescription(objective.description || '');
        setCycleId(objective.cycle_id);
        setGoalId(objective.goal_id || 'none');
        setStatus((objective.status as ObjectiveStatus) || 'active');
        setPriority((objective.priority as ObjectivePriority) || 'none');
        setConfidence(objective.confidence ?? 7);
        setStartDate(objective.start_date);
        setDueDate(objective.due_date);
      } else {
        const initialCycleId = defaultCycleId || cycles[0]?.id || '';
        const initialCycle = cycles.find((c) => c.id === initialCycleId);

        setTitle('');
        setDescription('');
        setCycleId(initialCycleId);
        setGoalId('none');
        setStatus('active');
        setPriority('none');
        setConfidence(7);
        setStartDate(initialCycle?.start_date || '');
        setDueDate(initialCycle?.end_date || '');
      }
      setError(null);
    }
  }, [isOpen, objective, defaultCycleId, cycles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const candidatePayload = {
      cycle_id: cycleId,
      goal_id: goalId === 'none' ? null : goalId,
      title,
      description,
      status,
      priority,
      confidence: confidence ?? null,
      start_date: startDate,
      due_date: dueDate,
    };

    const result = createObjectiveSchema.safeParse(candidatePayload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid objective input');
      return;
    }

    try {
      await onSave(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save objective');
    }
  };

  const isEditing = Boolean(objective);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Objective' : 'New Objective'}</DialogTitle>
            <DialogDescription>
              Time-bound, qualitative outcome anchored to a quarterly cycle that measurable key
              results will ladder into.
            </DialogDescription>
          </DialogHeader>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="objective-title">Objective Title</Label>
            <Input
              id="objective-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Elevate product craftsmanship to delight early adopters"
              maxLength={120}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="objective-description">Description (optional)</Label>
            <Textarea
              id="objective-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this objective meaningful for this cycle..."
              rows={2}
              maxLength={1000}
              className="resize-none font-sans"
            />
          </div>

          {/* Cycle & Parent Goal Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="objective-cycle">Planning Cycle</Label>
              <Select value={cycleId} onValueChange={handleCycleChange}>
                <SelectTrigger id="objective-cycle" aria-label="Planning Cycle">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {cycles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.cycle_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="objective-goal">Parent Goal (optional)</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger id="objective-goal" aria-label="Parent Goal">
                  <SelectValue placeholder="No parent goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Parent Goal</SelectItem>
                  {goals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority, Status & Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="objective-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as ObjectivePriority)}
              >
                <SelectTrigger id="objective-priority" aria-label="Priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="objective-status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as ObjectiveStatus)}>
                <SelectTrigger id="objective-status" aria-label="Status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="achieved">Achieved</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="objective-confidence">Confidence</Label>
                <span className="font-mono-num text-xs text-highlight font-semibold">
                  {confidence ? `${confidence}/10` : 'None'}
                </span>
              </div>
              <Select
                value={confidence ? String(confidence) : 'none'}
                onValueChange={(val) => setConfidence(val === 'none' ? null : Number(val))}
              >
                <SelectTrigger id="objective-confidence" aria-label="Confidence">
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
          </div>

          {/* Start and Due Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="objective-start-date">Start Date</Label>
              <Input
                id="objective-start-date"
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
              <Label htmlFor="objective-due-date">Due Date</Label>
              <Input
                id="objective-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
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
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Objective'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
