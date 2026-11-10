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
  type CreateGoalInput,
  type Domain,
  type Goal,
  type GoalPriority,
  type GoalStatus,
  createGoalSchema,
} from '../schema';
import { DomainIcon } from './DomainIcon';

interface GoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  domains: Domain[];
  onSave: (input: CreateGoalInput) => Promise<void>;
  isSaving: boolean;
}

export function GoalDialog({ isOpen, onClose, goal, domains, onSave, isSaving }: GoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domainId, setDomainId] = useState<string>('none');
  const [priority, setPriority] = useState<GoalPriority>('none');
  const [status, setStatus] = useState<GoalStatus>('active');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setDomainId(goal.domain_id || 'none');
        setPriority((goal.priority as GoalPriority) || 'none');
        setStatus((goal.status as GoalStatus) || 'active');
        setStartDate(goal.start_date || '');
        setTargetDate(goal.target_date || '');
      } else {
        setTitle('');
        setDescription('');
        setDomainId('none');
        setPriority('none');
        setStatus('active');
        setStartDate('');
        setTargetDate('');
      }
      setError(null);
    }
  }, [isOpen, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidatePayload = {
      title,
      description,
      domain_id: domainId === 'none' ? null : domainId,
      priority,
      status,
      start_date: startDate ? startDate : null,
      target_date: targetDate ? targetDate : null,
    };

    const result = createGoalSchema.safeParse(candidatePayload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid goal input');
      return;
    }

    try {
      await onSave(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    }
  };

  const isEditing = Boolean(goal);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Goal' : 'New Goal'}</DialogTitle>
            <DialogDescription>
              High-level directional goals tied to your life areas and achieved across quarters.
            </DialogDescription>
          </DialogHeader>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Goal Title</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Run a half-marathon, Ship v1.0 of Northstar"
              maxLength={120}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-description">Description (optional)</Label>
            <Textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this goal matters and what success looks like..."
              rows={2}
              maxLength={1000}
              className="resize-none font-sans"
            />
          </div>

          {/* Life Area & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="goal-domain">Life Area</Label>
              <Select value={domainId} onValueChange={setDomainId}>
                <SelectTrigger id="goal-domain" aria-label="Life Area">
                  <SelectValue placeholder="Select life area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Life Area</SelectItem>
                  {domains.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded flex items-center justify-center text-bg text-[10px]"
                          style={{ backgroundColor: d.color || 'var(--accent)' }}
                        >
                          <DomainIcon name={d.icon} className="w-2.5 h-2.5" />
                        </div>
                        <span className="truncate">{d.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-priority">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val as GoalPriority)}>
                <SelectTrigger id="goal-priority" aria-label="Priority">
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
          </div>

          {/* Status & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as GoalStatus)}>
                <SelectTrigger id="goal-status" aria-label="Status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-start-date">Start Date</Label>
              <Input
                id="goal-start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (error) setError(null);
                }}
                className="font-mono-num text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-target-date">Target Date</Label>
              <Input
                id="goal-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value);
                  if (error) setError(null);
                }}
                className="font-mono-num text-xs"
              />
            </div>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
