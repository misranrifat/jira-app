import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
          {
            'bg-gray-900 text-white': variant === 'default',
            'bg-gray-100 text-gray-900': variant === 'secondary',
            'bg-green-100 text-green-800': variant === 'success',
            'bg-yellow-100 text-yellow-800': variant === 'warning',
            'bg-red-100 text-red-800': variant === 'destructive',
            'border border-gray-200 text-gray-900': variant === 'outline',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };