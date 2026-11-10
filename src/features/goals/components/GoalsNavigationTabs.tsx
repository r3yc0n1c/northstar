import { Target, Flag, Folder } from 'lucide-react';

export type GoalsTab = 'okrs' | 'goals' | 'areas';

interface GoalsNavigationTabsProps {
  activeTab: GoalsTab;
  onTabChange: (tab: GoalsTab) => void;
  areasCount?: number;
  goalsCount?: number;
  okrsCount?: number;
}

export function GoalsNavigationTabs({
  activeTab,
  onTabChange,
  areasCount,
  goalsCount,
  okrsCount,
}: GoalsNavigationTabsProps) {
  const tabs: Array<{
    id: GoalsTab;
    label: string;
    icon: typeof Target;
    count?: number;
  }> = [
    {
      id: 'okrs',
      label: 'OKRs',
      icon: Target,
      count: okrsCount,
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Flag,
      count: goalsCount,
    },
    {
      id: 'areas',
      label: 'Life Areas',
      icon: Folder,
      count: areasCount,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Goals navigation"
      className="flex items-center gap-1.5 p-1 bg-surface-2/60 border border-border rounded-[10px] w-fit"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            type="button"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight ${
              isActive
                ? 'bg-surface text-text shadow-sm border border-highlight/40'
                : 'text-text-2 hover:text-text hover:bg-surface/50 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-highlight' : 'text-text-3'}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`font-mono-num text-[11px] px-1.5 py-0.2 rounded border ${
                  isActive
                    ? 'bg-accent/40 text-highlight border-highlight/30'
                    : 'bg-surface-2 text-text-3 border-border/40'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
