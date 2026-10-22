'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { NAV_LINKS } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { QuoteHeaderLink } from '@/components/quote/add-to-quote-button';
import { LogoLockup } from './logo';

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ whatsappHref }: { whatsappHref: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close the mobile menu whenever the route changes
  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-line/80 bg-offwhite/85 shadow-soft backdrop-blur-md'
          : 'bg-offwhite border-transparent',
      )}
    >
      <div className="container-site flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="shrink-0 rounded-md">
          <LogoLockup />
          <span className="sr-only"> — página inicial</span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'font-heading relative flex h-11 items-center px-4 text-[0.95rem] font-semibold transition-colors',
                      active ? 'text-brand-green' : 'text-ink/75 hover:text-brand-green',
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={cn(
                        'bg-brand-orange absolute inset-x-4 bottom-1 h-[3px] origin-left transition-transform duration-300',
                        active ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <QuoteHeaderLink />
          <Button asChild variant="green" className="hidden px-3 md:inline-flex xl:px-5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fale no WhatsApp"
            >
              <WhatsAppIcon />
              <span className="hidden xl:inline">Fale no WhatsApp</span>
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="text-brand-green hover:bg-brand-green/10 grid size-11 place-items-center rounded-[10px] md:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-6" aria-hidden />
              </button>
            </SheetTrigger>
            <SheetContent title="Menu">
              <nav
                aria-label="Navegação principal (celular)"
                className="flex-1 overflow-y-auto p-3"
              >
                <ul className="flex flex-col">
                  {NAV_LINKS.map((link) => {
                    const active = isActive(pathname, link.href);
                    return (
                      <li key={link.href}>
                        <SheetClose asChild>
                          <Link
                            href={link.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'font-heading flex min-h-13 items-center gap-3 rounded-[10px] px-3 text-lg font-semibold',
                              active ? 'bg-brand-green/8 text-brand-green' : 'text-ink',
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                'size-2.5 shrink-0',
                                active ? 'bg-brand-orange' : 'bg-line',
                              )}
                            />
                            {link.label}
                          </Link>
                        </SheetClose>
                      </li>
                    );
                  })}
                  <li>
                    <SheetClose asChild>
                      <Link
                        href="/orcamento"
                        aria-current={pathname === '/orcamento' ? 'page' : undefined}
                        className="font-heading text-ink flex min-h-13 items-center gap-3 rounded-[10px] px-3 text-lg font-semibold"
                      >
                        <span aria-hidden className="bg-line size-2.5 shrink-0" />
                        Lista de orçamento
                      </Link>
                    </SheetClose>
                  </li>
                </ul>
              </nav>
              <div className="border-line border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <Button asChild variant="whatsapp" size="lg" className="w-full">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                    Fale no WhatsApp
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
