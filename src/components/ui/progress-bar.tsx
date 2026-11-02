import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export interface ProgressBarProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  className,
  ...props
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-text-2">
          {label && <span className="font-medium text-text">{label}</span>}
          {showValue && <span className="font-mono-num ml-auto text-text">{clamped}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
        value={clamped}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 bg-highlight transition-all duration-300 ease-out"
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
