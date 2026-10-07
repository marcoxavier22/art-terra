'use client';
import { cn } from '@/lib/utils';
import type { Cor } from '@/lib/types';
import { Tooltip } from '@/components/ui/tooltip';

/** Light colours need a darker ring to stay visible on white cards. */
export function swatchStyle(hex: string): React.CSSProperties {
  return { backgroundColor: hex };
}

export function ColorSwatches({
  cores,
  max = 6,
  size = 'md',
  className,
}: {
  cores: Cor[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (cores.length === 0) return null;
  const visible = cores.slice(0, max);
  const extra = cores.length - visible.length;
  return (
    <ul
      aria-label={`Cores disponíveis: ${cores.map((c) => c.nome).join(', ')}`}
      className={cn('flex flex-wrap items-center gap-1.5', className)}
    >
      {visible.map((cor) => (
        <li key={cor.id} className="flex">
          <Tooltip label={cor.nome}>
            <span
              role="img"
              aria-label={cor.nome}
              tabIndex={0}
              style={swatchStyle(cor.hex)}
              className={cn(
                'border-ink/25 relative z-10 inline-block rounded-full border shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]',
                size === 'md' ? 'size-7' : 'size-6',
              )}
            />
          </Tooltip>
        </li>
      ))}
      {extra > 0 ? (
        <li className="text-muted text-xs font-semibold" aria-label={`mais ${extra} cores`}>
          +{extra}
        </li>
      ) : null}
    </ul>
  );
}
