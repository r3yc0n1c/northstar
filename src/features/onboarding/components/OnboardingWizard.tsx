import { useState } from 'react';
import { Button, ProgressBar } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { type WorkingHoursMap } from '@/features/settings';
import { resolveBrowserDefaults } from '@/lib/format';
import { useOnboarding } from '../hooks/useOnboarding';
import { Step1Calibration } from './Step1Calibration';
import { Step2LifeAreas } from './Step2LifeAreas';
import { Step3FirstGoal } from './Step3FirstGoal';
import { STARTER_LIFE_AREAS } from '../schema';
import { Compass, ArrowRight, ArrowLeft, FastForward, CheckCircle2 } from 'lucide-react';

export function OnboardingWizard() {
  const { user } = useAuth();
  const { skipOnboarding, isSkipping, completeOnboarding, isCompleting, error } = useOnboarding(
    user?.id,
  );

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Calibration
  const browserDefaults = resolveBrowserDefaults();
  const [timezone, setTimezone] = useState(browserDefaults.timezone);
  const [locale] = useState(browserDefaults.locale);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [workingHours, setWorkingHours] = useState<WorkingHoursMap>({
    mon: { start: '09:00', end: '17:00' },
    tue: { start: '09:00', end: '17:00' },
    wed: { start: '09:00', end: '17:00' },
    thu: { start: '09:00', end: '17:00' },
    fri: { start: '09:00', end: '17:00' },
  });

  // Step 2: Starter Life Areas (default selected: top 4)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    'career',
    'health',
    'learning',
    'finance',
  ]);

  // Step 3: Optional First Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAreaId, setGoalAreaId] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  const handleToggleArea = (areaId: string) => {
    setSelectedAreas((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId],
    );
  };

  const handleSelectAll = () => {
    setSelectedAreas(STARTER_LIFE_AREAS.map((a) => a.id));
  };

  const handleDeselectAll = () => {
    setSelectedAreas([]);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleFinish = async () => {
    await completeOnboarding({
      step1: {
        timezone,
        locale,
        working_days: workingDays,
        working_hours: workingHours,
      },
      step2: {
        selected_areas: selectedAreas,
      },
      step3: {
        goal_title: goalTitle,
        goal_area_id: goalAreaId || undefined,
        goal_target_date: goalTargetDate || undefined,
      },
    });
  };

  const progressPercent = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;
  const isPending = isSkipping || isCompleting;

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-accent border border-highlight/40 flex items-center justify-center text-highlight shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-text">Northstar</h1>
            <p className="text-xs text-text-2 font-mono">Personal Operating System</p>
          </div>
        </div>

        {/* Global Skip Button (Always Available) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => skipOnboarding()}
          disabled={isPending}
          className="text-xs text-text-2 hover:text-text gap-1.5 focus-visible:ring-highlight"
          aria-label="Skip onboarding and proceed directly to Today"
        >
          <span>Skip to app</span>
          <FastForward className="w-3.5 h-3.5" />
        </Button>
      </header>

      {/* Main Form Flow */}
      <main className="max-w-2xl w-full mx-auto py-8 space-y-6 flex-1">
        {/* Step Indicator & Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-text-2">
            <span>Step {currentStep} of 3</span>
            <span>
              {currentStep === 1
                ? 'Schedule & Capacity'
                : currentStep === 2
                  ? 'Life Areas'
                  : 'Optional First Goal'}
            </span>
          </div>
          <ProgressBar value={progressPercent} aria-label="Onboarding progress" />
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-3 bg-danger/10 border border-danger text-danger text-xs rounded-[6px]"
          >
            {error.message || 'An error occurred during onboarding.'}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <Step1Calibration
            timezone={timezone}
            onTimezoneChange={setTimezone}
            workingDays={workingDays}
            onWorkingDaysChange={setWorkingDays}
            workingHours={workingHours}
            onWorkingHoursChange={setWorkingHours}
          />
        )}

        {currentStep === 2 && (
          <Step2LifeAreas
            selectedAreas={selectedAreas}
            onToggleArea={handleToggleArea}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        )}

        {currentStep === 3 && (
          <Step3FirstGoal
            selectedAreas={selectedAreas}
            goalTitle={goalTitle}
            onGoalTitleChange={setGoalTitle}
            goalAreaId={goalAreaId}
            onGoalAreaIdChange={setGoalAreaId}
            goalTargetDate={goalTargetDate}
            onGoalTargetDateChange={setGoalTargetDate}
          />
        )}
      </main>

      {/* Footer Controls */}
      <footer className="max-w-2xl w-full mx-auto pt-6 border-t border-border flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isPending}
              className="gap-1.5 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStep < 3 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={isPending}
              className="gap-1.5 text-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleFinish}
              disabled={isPending}
              className="gap-1.5 text-xs bg-highlight hover:bg-highlight/90 text-bg font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleting ? 'Finishing setup...' : 'Finish setup'}</span>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
