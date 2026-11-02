import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-[4px] border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-2 text-text',
        secondary: 'border-border bg-surface text-text-2',
        destructive: 'border-danger/30 bg-danger/15 text-danger',
        outline: 'border-border text-text',
        success: 'border-success/30 bg-success/15 text-success',
        warning: 'border-warning/30 bg-warning/15 text-warning',
        highlight: 'border-highlight/30 bg-highlight/15 text-highlight',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
