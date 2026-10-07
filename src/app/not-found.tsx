import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, LayoutGrid } from 'lucide-react';
import { SiteShell } from '@/components/site/site-shell';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteShell>
      <section className="container-site flex min-h-[62vh] flex-col items-start justify-center py-16">
        <SectionLabel>Erro 404</SectionLabel>
        <h1 className="text-brand-green mt-4 max-w-2xl text-4xl leading-tight font-extrabold sm:text-5xl">
          Esta página não existe ou mudou de lugar
        </h1>
        <p className="text-muted mt-4 max-w-xl text-lg">
          O endereço pode ter sido digitado errado ou o produto saiu de linha. Você pode voltar ao
          início ou procurar no catálogo.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home />
              Voltar ao início
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/catalogo">
              <LayoutGrid />
              Ver o catálogo
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
