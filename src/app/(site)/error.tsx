'use client';
import * as React from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(`[site] ${error.digest ?? error.message}`);
  }, [error]);

  return (
    <section className="container-site flex min-h-[62vh] flex-col items-start justify-center py-16">
      <SectionLabel>Algo deu errado</SectionLabel>
      <h1 className="text-brand-green mt-4 max-w-2xl text-4xl leading-tight font-extrabold">
        Não conseguimos carregar esta página
      </h1>
      <p className="text-muted mt-4 max-w-xl text-lg">
        Pode ser uma instabilidade passageira. Tente novamente em instantes.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button size="lg" onClick={reset}>
          <RefreshCw />
          Tentar novamente
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </section>
  );
}
