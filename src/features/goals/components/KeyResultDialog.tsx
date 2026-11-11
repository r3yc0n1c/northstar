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
  type CreateKeyResultInput,
  type KeyResult,
  type KrDirection,
  type MetricType,
  type Objective,
  createKeyResultSchema,
} from '../schema';

interface KeyResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  keyResult?: KeyResult | null;
  objective: Objective;
  onSave: (input: CreateKeyResultInput) => Promise<void>;
  isSaving: boolean;
}

export function KeyResultDialog({
  isOpen,
  onClose,
  keyResult,
  objective,
  onSave,
  isSaving,
}: KeyResultDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [metricType, setMetricType] = useState<MetricType>('numeric');
  const [baselineValue, setBaselineValue] = useState<number>(0);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [targetValue, setTargetValue] = useState<number>(100);
  const [unit, setUnit] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [direction, setDirection] = useState<KrDirection>('increase');
  const [confidence, setConfidence] = useState<number | null>(7);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (keyResult) {
        setTitle(keyResult.title);
        setDescription(keyResult.description || '');
        setMetricType(keyResult.metric_type);
        setBaselineValue(Number(keyResult.baseline_value));
        setCurrentValue(Number(keyResult.current_value));
        setTargetValue(Number(keyResult.target_value));
        setUnit(keyResult.unit || '');
        setCurrencyCode(keyResult.currency_code || '');
        setDirection(keyResult.direction || 'increase');
        setConfidence(keyResult.confidence ?? 7);
        setStartDate(keyResult.start_date);
        setDueDate(keyResult.due_date);
      } else {
        setTitle('');
        setDescription('');
        setMetricType('numeric');
        setBaselineValue(0);
        setCurrentValue(0);
        setTargetValue(100);
        setUnit('');
        setCurrencyCode('');
        setDirection('increase');
        setConfidence(7);
        setStartDate(objective.start_date);
        setDueDate(objective.due_date);
      }
      setError(null);
    }
  }, [isOpen, keyResult, objective]);

  const handleMetricTypeChange = (type: MetricType) => {
    setMetricType(type);
    if (type === 'binary') {
      setBaselineValue(0);
      setTargetValue(1);
      setCurrentValue(0);
      setUnit('');
      setCurrencyCode('');
    } else {
      setBaselineValue(0);
      setCurrentValue(0);
      setTargetValue(100);
      setDirection('increase');
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const candidatePayload = {
      objective_id: objective.id,
      title,
      description,
      metric_type: metricType,
      baseline_value: baselineValue,
      current_value: currentValue,
      target_value: targetValue,
      unit,
      currency_code: currencyCode.trim() ? currencyCode.trim().toUpperCase() : null,
      direction: metricType === 'numeric' ? direction : null,
      confidence: confidence ?? null,
      start_date: startDate,
      due_date: dueDate,
    };

    const result = createKeyResultSchema.safeParse(candidatePayload);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid key result input');
      return;
    }

    try {
      await onSave(result.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save key result');
    }
  };

  const isEditing = Boolean(keyResult);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Key Result' : 'New Key Result'}</DialogTitle>
            <DialogDescription>
              Measurable outcome laddering into{' '}
              <span className="font-semibold text-text">{objective.title}</span>.
            </DialogDescription>
          </DialogHeader>

          {/* Metric Type Segmented Control */}
          <div className="space-y-1.5">
            <Label>Measurement Type</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-2/60 border border-border rounded-[8px]">
              <button
                type="button"
                onClick={() => handleMetricTypeChange('numeric')}
                className={`py-1.5 px-3 rounded-[6px] text-xs font-semibold transition-all ${
                  metricType === 'numeric'
                    ? 'bg-surface text-text shadow-sm border border-highlight/40'
                    : 'text-text-2 hover:text-text'
                }`}
              >
                Numeric (Target & Direction)
              </button>
              <button
                type="button"
                onClick={() => handleMetricTypeChange('binary')}
                className={`py-1.5 px-3 rounded-[6px] text-xs font-semibold transition-all ${
                  metricType === 'binary'
                    ? 'bg-surface text-text shadow-sm border border-highlight/40'
                    : 'text-text-2 hover:text-text'
                }`}
              >
                Binary (Done / Not Done)
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="kr-title">Key Result Title</Label>
            <Input
              id="kr-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                metricType === 'numeric'
                  ? 'e.g. Increase active weekly users from 2,000 to 5,000'
                  : 'e.g. Complete SOC 2 Type II audit report'
              }
              maxLength={120}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="kr-description">Description (optional)</Label>
            <Textarea
              id="kr-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, calculation method, or source of truth..."
              rows={2}
              maxLength={1000}
              className="resize-none font-sans"
            />
          </div>

          {/* Numeric Metric Configuration */}
          {metricType === 'numeric' && (
            <div className="space-y-3 p-3 rounded-[8px] bg-surface-2/40 border border-border/60">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="kr-baseline" className="text-xs">
                    Baseline
                  </Label>
                  <Input
                    id="kr-baseline"
                    type="number"
                    step="any"
                    value={baselineValue}
                    onChange={(e) => {
                      setBaselineValue(Number(e.target.value));
                      if (error) setError(null);
                    }}
                    className="font-mono-num text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="kr-current" className="text-xs">
                    Current
                  </Label>
                  <Input
                    id="kr-current"
                    type="number"
                    step="any"
                    value={currentValue}
                    onChange={(e) => {
                      setCurrentValue(Number(e.target.value));
                      if (error) setError(null);
                    }}
                    className="font-mono-num text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="kr-target" className="text-xs">
                    Target
                  </Label>
                  <Input
                    id="kr-target"
                    type="number"
                    step="any"
                    value={targetValue}
                    onChange={(e) => {
                      setTargetValue(Number(e.target.value));
                      if (error) setError(null);
                    }}
                    className="font-mono-num text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="kr-direction" className="text-xs">
                    Direction
                  </Label>
                  <Select
                    value={direction}
                    onValueChange={(val) => {
                      setDirection(val as KrDirection);
                      if (error) setError(null);
                    }}
                  >
                    <SelectTrigger id="kr-direction" aria-label="Direction">
                      <SelectValue placeholder="Direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase ↑</SelectItem>
                      <SelectItem value="decrease">Decrease ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="kr-unit" className="text-xs">
                    Unit
                  </Label>
                  <Input
                    id="kr-unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="%, users, kg"
                    maxLength={30}
                    className="font-mono-num text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="kr-currency" className="text-xs">
                    Currency (optional)
                  </Label>
                  <Input
                    id="kr-currency"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                    placeholder="USD"
                    maxLength={3}
                    className="font-mono-num text-xs uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Binary Metric Configuration */}
          {metricType === 'binary' && (
            <div className="p-3 rounded-[8px] bg-surface-2/40 border border-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-text">Completion State</span>
                <p className="text-[11px] text-text-2">Binary outcomes are either 0% or 100%.</p>
              </div>

              <Select
                value={String(currentValue)}
                onValueChange={(val) => setCurrentValue(Number(val))}
              >
                <SelectTrigger className="w-36 font-mono-num text-xs" aria-label="Binary State">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (Not Done)</SelectItem>
                  <SelectItem value="1">1 (Done)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Confidence and Timeline Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="kr-confidence">Confidence</Label>
                <span className="font-mono-num text-xs text-highlight font-semibold">
                  {confidence ? `${confidence}/10` : 'None'}
                </span>
              </div>
              <Select
                value={confidence ? String(confidence) : 'none'}
                onValueChange={(val) => setConfidence(val === 'none' ? null : Number(val))}
              >
                <SelectTrigger id="kr-confidence" aria-label="Confidence">
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

            <div className="space-y-1.5">
              <Label htmlFor="kr-start-date">Start Date</Label>
              <Input
                id="kr-start-date"
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
              <Label htmlFor="kr-due-date">Due Date</Label>
              <Input
                id="kr-due-date"
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

          {error && <p className="text-xs text-danger font-medium">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Key Result'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
