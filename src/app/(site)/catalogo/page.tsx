import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CatalogBrowser, CatalogSkeleton } from '@/components/catalog/catalog-browser';
import { CatalogError } from '@/components/catalog/catalog-error';
import { JsonLd } from '@/components/site/json-ld';
import { PageHeader } from '@/components/site/page-header';
import { getCatalogSafe, getSettings } from '@/lib/data';
import { breadcrumbJsonLd } from '@/lib/seo';
import { retryCatalog } from './actions';

export const metadata: Metadata = {
  title: { absolute: 'Catálogo de Pisos, Cobogós e Bordas Atérmicas | Art Terra' },
  description:
    'Catálogo da Art Terra: pisos de concreto, cobogós, bordas e pisos atérmicos para piscina e artefatos de cimento. Medidas, cores e orçamento.',
  alternates: { canonical: '/catalogo' },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Reading the query on the server renders the filtered grid into the HTML (good for SEO
  // and first paint) instead of leaving it to the browser. Data still comes from the cache.
  const sp = await searchParams;
  const [settings, catalog] = await Promise.all([getSettings(), getCatalogSafe()]);

  // Old links (/catalogo?cat=cobogos) now live on their own indexable page.
  const cat = typeof sp.cat === 'string' ? sp.cat : null;
  if (cat && catalog.categorias.some((c) => c.slug === cat)) {
    const rest = new URLSearchParams();
    for (const [k, v] of Object.entries(sp))
      if (k !== 'cat' && typeof v === 'string') rest.set(k, v);
    const qs = rest.toString();
    redirect(`/catalogo/${cat}${qs ? `?${qs}` : ''}`);
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: 'Catálogo', path: '/catalogo' },
        ])}
      />
      <PageHeader
        eyebrow="Direto da fábrica"
        title="Catálogo de produtos"
        description="Pisos, cobogós, bordas atérmicas e artefatos de concreto. Filtre por onde vai usar, monte sua lista e receba o orçamento pelo WhatsApp."
      />
      {catalog.ok ? (
        // useSearchParams needs a Suspense boundary; the fallback doubles as the loading skeleton
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogBrowser
            categorias={catalog.categorias}
            produtos={catalog.produtos}
            whatsapp={settings.whatsapp}
            pdfUrl={settings.catalogo_pdf_url}
          />
        </Suspense>
      ) : (
        <CatalogError whatsapp={settings.whatsapp} retry={retryCatalog} />
      )}
    </>
  );
}
