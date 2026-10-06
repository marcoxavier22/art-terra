import { cn } from '@/lib/utils';

/**
 * Brand marker from the printed catalogue: a small orange square followed by
 * an uppercase label (the "■ 05" page numbers).
 */
export function SectionLabel({
  children,
  tone = 'light',
  className,
}: {
  children: React.ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-heading flex items-center gap-2.5 text-[0.8rem] font-semibold tracking-[0.18em] uppercase',
        tone === 'light' ? 'text-brand-orange-ink' : 'text-brand-orange',
        className,
      )}
    >
      <span aria-hidden className="bg-brand-orange inline-block size-2.5 shrink-0" />
      {children}
    </p>
  );
}
