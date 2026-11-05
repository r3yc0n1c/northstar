import { useMemo } from 'react';
import { Switch, Input, Label } from '@/components/ui';
import { DAY_KEYS, DAY_LABELS, DAY_NUMBER_MAP, type DayKey, type WorkingHoursMap } from '../schema';

export interface WorkingHoursEditorProps {
  workingDays: number[];
  onWorkingDaysChange: (days: number[]) => void;
  workingHours: WorkingHoursMap;
  onWorkingHoursChange: (hours: WorkingHoursMap) => void;
  disabled?: boolean;
}

export function WorkingHoursEditor({
  workingDays,
  onWorkingDaysChange,
  workingHours,
  onWorkingHoursChange,
  disabled = false,
}: WorkingHoursEditorProps) {
  const toggleDay = (dayKey: DayKey) => {
    const dayNum = DAY_NUMBER_MAP[dayKey];
    const isCurrentlyActive = workingDays.includes(dayNum);

    if (isCurrentlyActive) {
      // Remove day
      onWorkingDaysChange(workingDays.filter((d) => d !== dayNum));
    } else {
      // Add day and ensure default hours if missing
      onWorkingDaysChange([...workingDays, dayNum].sort());
      if (!workingHours[dayKey]) {
        onWorkingHoursChange({
          ...workingHours,
          [dayKey]: { start: '09:00', end: '17:00' },
        });
      }
    }
  };

  const handleTimeChange = (dayKey: DayKey, field: 'start' | 'end', newValue: string) => {
    const current = workingHours[dayKey] || { start: '09:00', end: '17:00' };
    onWorkingHoursChange({
      ...workingHours,
      [dayKey]: {
        ...current,
        [field]: newValue,
      },
    });
  };

  // Calculate total weekly capacity in hours
  const weeklyTotalHours = useMemo(() => {
    let totalMinutes = 0;
    for (const dayKey of DAY_KEYS) {
      const dayNum = DAY_NUMBER_MAP[dayKey];
      if (workingDays.includes(dayNum)) {
        const hours = workingHours[dayKey];
        if (hours?.start && hours?.end && hours.end > hours.start) {
          const startParts = hours.start.split(':').map(Number);
          const endParts = hours.end.split(':').map(Number);
          const startH = startParts[0];
          const startM = startParts[1];
          const endH = endParts[0];
          const endM = endParts[1];
          if (
            startH !== undefined &&
            startM !== undefined &&
            endH !== undefined &&
            endM !== undefined
          ) {
            const diffMinutes = endH * 60 + endM - (startH * 60 + startM);
            if (diffMinutes > 0) {
              totalMinutes += diffMinutes;
            }
          }
        }
      }
    }
    return Math.round((totalMinutes / 60) * 10) / 10;
  }, [workingDays, workingHours]);

  return (
    <div className="space-y-4" data-purpose="working-hours-editor">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h3 className="text-sm font-medium text-text">Working Days & Daily Hours</h3>
          <p className="text-xs text-text-2 mt-0.5">
            Defines your target schedule and baseline daily execution capacity.
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-text-2">Weekly Target</span>
          <p className="font-mono text-sm font-semibold text-text">
            {weeklyTotalHours} <span className="text-xs text-text-2">hrs/wk</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {DAY_KEYS.map((dayKey) => {
          const dayNum = DAY_NUMBER_MAP[dayKey];
          const isActive = workingDays.includes(dayNum);
          const hours = workingHours[dayKey] || { start: '09:00', end: '17:00' };
          const isInvalidRange = isActive && hours.end <= hours.start;

          return (
            <div
              key={dayKey}
              className={`p-3 rounded-[6px] border transition-colors ${
                isActive ? 'bg-surface border-border' : 'bg-surface/40 border-border/40 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Switch
                    id={`toggle-${dayKey}`}
                    checked={isActive}
                    onCheckedChange={() => toggleDay(dayKey)}
                    disabled={disabled}
                    aria-label={`Toggle ${DAY_LABELS[dayKey]}`}
                  />
                  <Label
                    htmlFor={`toggle-${dayKey}`}
                    className={`text-sm cursor-pointer ${
                      isActive ? 'font-medium text-text' : 'text-text-2'
                    }`}
                  >
                    {DAY_LABELS[dayKey]}
                  </Label>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={`start-${dayKey}`} className="sr-only">
                        {DAY_LABELS[dayKey]} Start Time
                      </Label>
                      <Input
                        id={`start-${dayKey}`}
                        type="time"
                        value={hours.start}
                        onChange={(e) => handleTimeChange(dayKey, 'start', e.target.value)}
                        disabled={disabled}
                        className="h-8 w-28 px-2 font-mono text-xs bg-surface-2 border-border"
                      />
                      <span className="text-text-3 text-xs font-mono">to</span>
                      <Label htmlFor={`end-${dayKey}`} className="sr-only">
                        {DAY_LABELS[dayKey]} End Time
                      </Label>
                      <Input
                        id={`end-${dayKey}`}
                        type="time"
                        value={hours.end}
                        onChange={(e) => handleTimeChange(dayKey, 'end', e.target.value)}
                        disabled={disabled}
                        aria-invalid={isInvalidRange}
                        className={`h-8 w-28 px-2 font-mono text-xs bg-surface-2 border-border ${
                          isInvalidRange ? 'border-danger focus-visible:ring-danger' : ''
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-text-3">Off Day</span>
                )}
              </div>

              {isInvalidRange && (
                <div className="mt-2 text-xs text-danger flex items-center gap-1" role="alert">
                  <span>End time must be after start time</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
