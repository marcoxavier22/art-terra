'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Palette,
  Settings,
  Tags,
} from 'lucide-react';
import { LogoLockup } from '@/components/site/logo';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Início', icon: LayoutDashboard },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
  { href: '/admin/cores', label: 'Cores', icon: Palette },
  { href: '/admin/galeria', label: 'Galeria', icon: Images },
  { href: '/admin/mensagens', label: 'Mensagens', icon: Mail },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
] as const;

// the four most used sections live in the phone's bottom bar; the rest go under "Mais"
const BOTTOM = ['/admin', '/admin/produtos', '/admin/galeria', '/admin/mensagens'];

function isActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

export function AdminShell({
  email,
  unread,
  children,
}: {
  email: string;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = React.useState(false);
  React.useEffect(() => setMoreOpen(false), [pathname]);

  async function signOut() {
    await createClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  const badge = (href: string) =>
    href === '/admin/mensagens' && unread > 0 ? (
      <span className="ml-auto rounded-full bg-brand-orange px-2 py-0.5 text-xs font-bold text-brand-green-dark tabular-nums">
        {unread}
        <span className="sr-only"> não lidas</span>
      </span>
    ) : null;

  const navList = (onNavigate?: boolean) => (
    <ul className="space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        const link = (
          <Link
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex min-h-12 items-center gap-3 rounded-[10px] px-3.5 font-heading font-semibold transition-colors',
              active ? 'bg-brand-green text-white' : 'text-ink hover:bg-brand-green/8',
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            {label}
            {badge(href)}
          </Link>
        );
        return <li key={href}>{onNavigate ? <SheetClose asChild>{link}</SheetClose> : link}</li>;
      })}
    </ul>
  );

  const footerLinks = (
    <div className="space-y-1 border-t border-line pt-3">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center gap-3 rounded-[10px] px-3.5 font-heading font-semibold text-ink hover:bg-brand-green/8"
      >
        <ExternalLink className="size-5" aria-hidden />
        Ver site
      </a>
      <button
        type="button"
        onClick={signOut}
        className="flex min-h-12 w-full items-center gap-3 rounded-[10px] px-3.5 font-heading font-semibold text-danger hover:bg-danger/8"
      >
        <LogOut className="size-5" aria-hidden />
        Sair
      </button>
      <p className="truncate px-3.5 pt-1 text-xs text-muted" title={email}>
        {email}
      </p>
    </div>
  );

  return (
    <div className="min-h-dvh bg-offwhite lg:pl-64">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white p-4 lg:flex">
        <Link href="/admin" className="mb-6 rounded-md px-1.5 py-1" aria-label="Painel Art Terra">
          <LogoLockup />
        </Link>
        <nav aria-label="Menu do painel" className="flex-1 overflow-y-auto">
          {navList()}
        </nav>
        {footerLinks}
      </aside>

      {/* phone top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Link href="/admin" aria-label="Painel Art Terra" className="rounded-md">
          <LogoLockup className="origin-left scale-90" />
        </Link>
        <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-muted">Painel</span>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-16">
        {children}
      </main>

      {/* phone bottom navigation */}
      <nav
        aria-label="Menu do painel"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV.filter((n) => BOTTOM.includes(n.href)).map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold',
                    active ? 'text-brand-green' : 'text-muted',
                  )}
                >
                  {active ? <span aria-hidden className="absolute top-0 h-1 w-8 bg-brand-orange" /> : null}
                  <span className="relative">
                    <Icon className="size-6" aria-hidden />
                    {href === '/admin/mensagens' && unread > 0 ? (
                      <span className="absolute -top-1.5 -right-2.5 grid min-w-5 place-items-center rounded-full bg-brand-orange px-1 text-[0.65rem] font-bold text-brand-green-dark">
                        {unread}
                      </span>
                    ) : null}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold',
                    NAV.some((n) => !BOTTOM.includes(n.href) && isActive(pathname, n.href))
                      ? 'text-brand-green'
                      : 'text-muted',
                  )}
                >
                  <Menu className="size-6" aria-hidden />
                  Mais
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" title="Menu do painel">
                <div className="overflow-y-auto p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  {navList(true)}
                  <div className="mt-3">{footerLinks}</div>
                </div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </div>
  );
}
