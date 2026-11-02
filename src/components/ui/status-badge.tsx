import { CheckCircle2, AlertTriangle, AlertCircle, CircleDashed, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType = 'on_track' | 'at_risk' | 'off_track' | 'not_started' | 'achieved';

interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  on_track: {
    label: 'On track',
    icon: CheckCircle2,
    classes: 'text-success bg-success/15 border-success/30',
  },
  at_risk: {
    label: 'At risk',
    icon: AlertTriangle,
    classes: 'text-warning bg-warning/15 border-warning/30',
  },
  off_track: {
    label: 'Off track',
    icon: AlertCircle,
    classes: 'text-danger bg-danger/15 border-danger/30',
  },
  not_started: {
    label: 'Not started',
    icon: CircleDashed,
    classes: 'text-text-2 bg-surface-2 border-border',
  },
  achieved: {
    label: 'Achieved',
    icon: Sparkles,
    classes: 'text-highlight bg-highlight/15 border-highlight/30',
  },
};

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 text-xs font-medium select-none',
        config.classes,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{displayLabel}</span>
    </span>
  );
}
