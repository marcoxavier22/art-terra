'use client';
import * as React from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/ui/icons';

/** Floating WhatsApp button + discreet "back to top", stacked bottom-right. */
export function FloatingActions({ whatsappHref }: { whatsappHref: string }) {
  const [showTop, setShowTop] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="floating-actions pointer-events-none fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex flex-col items-center gap-3 sm:right-6 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Voltar ao topo"
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        className={cn(
          'border-line text-brand-green shadow-soft hover:bg-brand-green grid size-11 place-items-center rounded-full border bg-white transition-all duration-300 hover:text-white',
          showTop ? 'pointer-events-auto translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="animate-wa-pulse bg-whatsapp hover:bg-whatsapp-dark pointer-events-auto hidden size-14 place-items-center rounded-full text-white transition-transform duration-200 hover:scale-105 md:grid"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </div>
  );
}
