import { Input, Label } from '@/components/ui';
import { STARTER_LIFE_AREAS } from '../schema';
import { Target, Calendar, Sparkles } from 'lucide-react';

interface Step3FirstGoalProps {
  selectedAreas: string[];
  goalTitle: string;
  onGoalTitleChange: (title: string) => void;
  goalAreaId: string;
  onGoalAreaIdChange: (areaId: string) => void;
  goalTargetDate: string;
  onGoalTargetDateChange: (date: string) => void;
}

export function Step3FirstGoal({
  selectedAreas,
  goalTitle,
  onGoalTitleChange,
  goalAreaId,
  onGoalAreaIdChange,
  goalTargetDate,
  onGoalTargetDateChange,
}: Step3FirstGoalProps) {
  // Filter starter areas to what user selected in step 2 (or all if none chosen)
  const availableAreas =
    selectedAreas.length > 0
      ? STARTER_LIFE_AREAS.filter((a) => selectedAreas.includes(a.id))
      : STARTER_LIFE_AREAS;

  return (
    <div className="space-y-6" data-purpose="onboarding-step-3">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-highlight/15 text-highlight text-xs font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optional</span>
        </div>
        <h2 className="text-xl font-bold text-text">Set your first high-level goal</h2>
        <p className="text-sm text-text-2 mt-1">
          Give yourself a clear direction. Goals span quarters or years and connect down to your
          daily actions.
        </p>
      </div>

      <div className="p-6 rounded-[10px] border border-border bg-surface space-y-5">
        <div className="space-y-2">
          <Label htmlFor="goal-title" className="text-xs text-text-2 font-medium">
            Goal Title
          </Label>
          <div className="relative">
            <Target className="absolute left-3 top-2.5 w-4 h-4 text-text-3" />
            <Input
              id="goal-title"
              type="text"
              placeholder="e.g. Run a half marathon, Launch MVP, Save $10,000"
              value={goalTitle}
              onChange={(e) => onGoalTitleChange(e.target.value)}
              maxLength={120}
              className="pl-9 bg-surface-2 border-border text-sm"
            />
          </div>
          <span className="text-[11px] text-text-3 font-mono block text-right">
            {goalTitle.length}/120
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goal-area" className="text-xs text-text-2 font-medium">
              Life Area (Domain)
            </Label>
            <select
              id="goal-area"
              value={goalAreaId}
              onChange={(e) => onGoalAreaIdChange(e.target.value)}
              className="w-full h-9 rounded-[6px] border border-border bg-surface-2 px-3 text-xs text-text focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-offset-2 focus:ring-offset-bg"
            >
              <option value="">None (General)</option>
              {availableAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-target-date" className="text-xs text-text-2 font-medium">
              Target Completion Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-text-3" />
              <Input
                id="goal-target-date"
                type="date"
                value={goalTargetDate}
                onChange={(e) => onGoalTargetDateChange(e.target.value)}
                className="pl-9 bg-surface-2 border-border text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-3 leading-relaxed">
        You don't need to define objectives or key results right now. You can refine this goal, add
        milestones, or start directly from Today.
      </p>
    </div>
  );
}
