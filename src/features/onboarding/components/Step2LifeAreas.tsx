import { Button } from '@/components/ui';
import { STARTER_LIFE_AREAS, type StarterLifeArea } from '../schema';
import { Briefcase, HeartPulse, BookOpen, Wallet, Users, Sparkles, Check } from 'lucide-react';

interface Step2LifeAreasProps {
  selectedAreas: string[];
  onToggleArea: (areaId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  'heart-pulse': HeartPulse,
  'book-open': BookOpen,
  wallet: Wallet,
  users: Users,
  sparkles: Sparkles,
};

export function Step2LifeAreas({
  selectedAreas,
  onToggleArea,
  onSelectAll,
  onDeselectAll,
}: Step2LifeAreasProps) {
  const allSelected = selectedAreas.length === STARTER_LIFE_AREAS.length;

  return (
    <div className="space-y-6" data-purpose="onboarding-step-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text">Choose starter life areas</h2>
          <p className="text-sm text-text-2 mt-1">
            Life areas organize your high-level goals and projects. Pick what matters most to you
            right now.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="text-xs text-text-2 hover:text-text"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STARTER_LIFE_AREAS.map((area: StarterLifeArea) => {
          const isSelected = selectedAreas.includes(area.id);
          const Icon = ICON_MAP[area.icon] || Sparkles;

          return (
            <button
              type="button"
              key={area.id}
              onClick={() => onToggleArea(area.id)}
              aria-pressed={isSelected}
              className={`p-4 rounded-[10px] border transition-all cursor-pointer select-none text-left flex items-start gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                isSelected
                  ? 'bg-surface border-highlight/70 shadow-sm'
                  : 'bg-surface/50 border-border hover:border-border/80 hover:bg-surface'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-highlight/20 text-highlight' : 'bg-surface-2 text-text-3'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-text truncate block">
                    {area.name}
                  </span>
                  <div
                    className={`h-4 w-4 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-accent border-accent text-text' : 'border-border bg-surface'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>
                <span className="text-xs text-text-2 mt-1 leading-relaxed block">
                  {area.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-surface rounded-[6px] border border-border text-xs text-text-2 flex items-center gap-2">
        <Check className="w-4 h-4 text-highlight shrink-0" />
        <span>You can rename, color, reorder, or add custom life areas anytime later.</span>
      </div>
    </div>
  );
}
