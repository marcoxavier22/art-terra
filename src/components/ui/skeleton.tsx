import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('bg-line/70 animate-pulse rounded-md', className)} />;
}
