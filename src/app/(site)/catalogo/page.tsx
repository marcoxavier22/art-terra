import { Suspense } from 'react';
import type { Metadata } from 'next';
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
    'Catálogo 2025 da Art Terra: pisos de concreto, cobogós, bordas e pisos atérmicos para piscina e artefatos de cimento. Medidas, cores e orçamento.',
  alternates: { canonical: '/catalogo' },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Reading the query on the server renders the filtered grid into the HTML (good for SEO
  // and first paint) instead of leaving it to the browser. Data still comes from the cache.
  await searchParams;
  const [settings, catalog] = await Promise.all([getSettings(), getCatalogSafe()]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: 'Catálogo', path: '/catalogo' },
        ])}
      />
      <PageHeader
        eyebrow="Elegância atemporal"
        title="Catálogo 2025"
        description="Todas as linhas da fábrica em um só lugar. Filtre por linha, busque pelo nome e peça seu orçamento direto pelo WhatsApp."
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
