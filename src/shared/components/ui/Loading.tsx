import { cn } from '@/lib/utils';

export interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ className, size = 'md' }: LoadingProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-b-2 border-blue-600',
          {
            'h-4 w-4': size === 'sm',
            'h-8 w-8': size === 'md',
            'h-12 w-12': size === 'lg',
          }
        )}
      />
    </div>
  );
}
