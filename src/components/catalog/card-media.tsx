'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { ProductImage } from './product-image';

/**
 * Card photo with an instant "Peça / Aplicada" switch. The applied photo is only requested
 * when the visitor asks for it (tap) or hovers on desktop, so the grid stays light.
 */
export function CardMedia({
  peca,
  aplicacao,
  altPeca,
  altAplicacao,
  sizes,
  priority,
}: {
  peca: string | null;
  aplicacao: string | null;
  altPeca: string;
  altAplicacao: string;
  sizes: string;
  priority?: boolean;
}) {
  const [applied, setApplied] = React.useState(false);
  const [loadApplied, setLoadApplied] = React.useState(false);
  const show = (v: boolean) => {
    if (v) setLoadApplied(true);
    setApplied(v);
  };

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={aplicacao ? () => setLoadApplied(true) : undefined}
    >
      <ProductImage
        src={peca}
        alt={altPeca}
        sizes={sizes}
        priority={priority}
        className="transition-transform duration-500 group-hover:scale-[1.04]"
      />
      {aplicacao && loadApplied ? (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            applied ? 'opacity-100' : 'opacity-0 [@media(hover:hover)]:group-hover:opacity-100',
          )}
        >
          <ProductImage src={aplicacao} alt={applied ? altAplicacao : ''} sizes={sizes} />
        </div>
      ) : null}
      {aplicacao ? (
        <div
          role="group"
          aria-label="Foto exibida"
          className="absolute bottom-2 left-2 z-10 flex rounded-full bg-white/92 p-0.5 text-[0.68rem] font-semibold shadow-sm backdrop-blur-sm sm:bottom-3 sm:left-3 sm:text-xs"
        >
          {(
            [
              [false, 'Peça'],
              [true, 'Aplicada'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={applied === value}
              onClick={() => show(value)}
              className={cn(
                'font-heading relative min-h-8 rounded-full px-2.5 transition-colors after:absolute after:-inset-1.5 sm:px-3',
                applied === value ? 'bg-brand-green text-white' : 'text-brand-green',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
