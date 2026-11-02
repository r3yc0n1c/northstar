import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[240px] flex-col items-center justify-center rounded-[10px] border border-dashed border-border bg-surface/50 p-8 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 border border-border text-text-2">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-2">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
