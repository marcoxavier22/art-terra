'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, House, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from '@/components/ui/icons';
import { QuoteCount } from '@/components/quote/add-to-quote-button';

/**
 * Phone-only bottom bar: catalogue, quote list and WhatsApp always within thumb reach.
 * Replaces the floating WhatsApp bubble on small screens.
 */
export function MobileNav({ whatsappHref }: { whatsappHref: string }) {
  const pathname = usePathname();
  const items = [
    { href: '/', label: 'Início', icon: House, active: pathname === '/' },
    {
      href: '/catalogo',
      label: 'Catálogo',
      icon: LayoutGrid,
      active: pathname.startsWith('/catalogo'),
    },
    {
      href: '/orcamento',
      label: 'Orçamento',
      icon: ClipboardList,
      active: pathname === '/orcamento',
      badge: true,
    },
  ];
  return (
    <nav
      aria-label="Atalhos"
      className="border-line fixed inset-x-0 bottom-0 z-40 border-t bg-white/96 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-16 flex-col items-center justify-center gap-1 text-[0.72rem] font-semibold',
                active ? 'text-brand-green' : 'text-muted',
              )}
            >
              {active ? (
                <span aria-hidden className="bg-brand-orange absolute top-0 h-1 w-8" />
              ) : null}
              <span className="relative">
                <Icon className="size-6" aria-hidden />
                {badge ? <QuoteCount className="absolute -top-1.5 -right-3" /> : null}
              </span>
              {label}
            </Link>
          </li>
        ))}
        <li>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar no WhatsApp"
            className="flex h-16 text-[#0f7a3c] flex-col items-center justify-center gap-1 text-[0.72rem] font-semibold"
          >
            <WhatsAppIcon className="size-6" />
            WhatsApp
          </a>
        </li>
      </ul>
    </nav>
  );
}
