import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 min-h-[36px] sm:min-h-0 select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-text hover:bg-accent-hover active:bg-accent-hover/90 shadow-sm',
        secondary: 'bg-surface-2 text-text border border-border hover:bg-muted active:bg-surface',
        ghost: 'text-text-2 hover:bg-surface-2 hover:text-text',
        destructive: 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
        outline: 'border border-border bg-transparent text-text hover:bg-surface-2',
        link: 'text-highlight underline-offset-4 hover:underline p-0 h-auto min-h-0',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6 text-base',
        icon: 'h-9 w-9 p-0 min-w-[36px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin text-text-2" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
