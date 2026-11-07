import { Button } from '@/components/ui';
import { TimezoneSelect, WorkingHoursEditor, type WorkingHoursMap } from '@/features/settings';
import { resolveBrowserDefaults } from '@/lib/format';
import { RotateCcw } from 'lucide-react';

interface Step1CalibrationProps {
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  workingDays: number[];
  onWorkingDaysChange: (days: number[]) => void;
  workingHours: WorkingHoursMap;
  onWorkingHoursChange: (hours: WorkingHoursMap) => void;
}

export function Step1Calibration({
  timezone,
  onTimezoneChange,
  workingDays,
  onWorkingDaysChange,
  workingHours,
  onWorkingHoursChange,
}: Step1CalibrationProps) {
  const handleResetDefaults = () => {
    const defaults = resolveBrowserDefaults();
    onTimezoneChange(defaults.timezone);
    onWorkingDaysChange([1, 2, 3, 4, 5]);
    onWorkingHoursChange({
      mon: { start: '09:00', end: '17:00' },
      tue: { start: '09:00', end: '17:00' },
      wed: { start: '09:00', end: '17:00' },
      thu: { start: '09:00', end: '17:00' },
      fri: { start: '09:00', end: '17:00' },
    });
  };

  return (
    <div className="space-y-6" data-purpose="onboarding-step-1">
      <div>
        <h2 className="text-xl font-bold text-text">Calibrate your schedule</h2>
        <p className="text-sm text-text-2 mt-1">
          Northstar uses your timezone and working hours to plan daily capacity realistically.
        </p>
      </div>

      <div className="p-5 rounded-[10px] border border-border bg-surface space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-text">Timezone</h3>
            <p className="text-xs text-text-2">Detected automatically from your browser</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs text-text-2 hover:text-text gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Browser defaults</span>
          </Button>
        </div>

        <div className="max-w-md">
          <TimezoneSelect value={timezone} onChange={onTimezoneChange} />
        </div>
      </div>

      <div className="p-5 rounded-[10px] border border-border bg-surface">
        <WorkingHoursEditor
          workingDays={workingDays}
          workingHours={workingHours}
          onWorkingDaysChange={onWorkingDaysChange}
          onWorkingHoursChange={onWorkingHoursChange}
        />
      </div>
    </div>
  );
}
