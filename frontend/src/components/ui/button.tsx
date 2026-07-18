import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/40',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border-2 border-muted bg-transparent hover:bg-muted hover:text-foreground',
        secondary: 'bg-muted/50 text-foreground hover:bg-muted',
        ghost: 'hover:bg-muted hover:text-foreground',
      },
      size: {
        default: 'h-12 px-6 py-2',
        sm: 'h-9 px-4 rounded-xl',
        lg: 'h-14 px-10 rounded-3xl text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} {...props}>
        {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
export { Button, buttonVariants };