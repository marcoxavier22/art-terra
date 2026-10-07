'use client';
import * as React from 'react';
import Image from 'next/image';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { BLUR_DATA_URL } from '@/lib/site';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string | null;
}

/**
 * Full-screen image viewer. Keyboard: ← → navigate, ESC closes. Touch: swipe to
 * navigate; pinch-zoom is left to the browser (touch-action: pinch-zoom).
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: LightboxImage[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const open = index !== null;
  const total = images.length;
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);

  const go = React.useCallback(
    (delta: number) => {
      if (index === null || total < 2) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  const current = index !== null ? images[index] : null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[70] bg-[#0d160f]/95" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] flex flex-col outline-none"
          onTouchStart={(e) => {
            if (e.touches.length === 1)
              touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            else touchStart.current = null;
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            touchStart.current = null;
            if (!start) return;
            const dx = e.changedTouches[0].clientX - start.x;
            const dy = e.changedTouches[0].clientY - start.y;
            // ignore when the page is pinch-zoomed, so panning a zoomed photo doesn't flip it
            const zoomed = (window.visualViewport?.scale ?? 1) > 1.05;
            if (!zoomed && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
              go(dx < 0 ? 1 : -1);
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2 text-white">
            <DialogPrimitive.Title className="font-heading text-sm font-semibold tracking-wide">
              {index !== null ? `Foto ${index + 1} de ${total}` : 'Fotos'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Fechar"
              className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="size-6" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <div className="relative min-h-0 flex-1 touch-pinch-zoom" onClick={onClose}>
            {current ? (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                quality={85}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-contain p-2 sm:p-6"
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
            {total > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className="hover:bg-brand-orange hover:text-brand-green-dark absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur sm:left-5"
                >
                  <ChevronLeft className="size-7" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Próxima foto"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className="hover:bg-brand-orange hover:text-brand-green-dark absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur sm:right-5"
                >
                  <ChevronRight className="size-7" aria-hidden />
                </button>
              </>
            ) : null}
          </div>

          <p
            aria-live="polite"
            className="min-h-12 px-5 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] text-center text-sm text-white/85"
          >
            {current?.caption ?? current?.alt}
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
