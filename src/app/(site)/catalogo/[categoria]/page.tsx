import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, MapPin } from 'lucide-react';
import { CatalogBrowser, CatalogSkeleton } from '@/components/catalog/catalog-browser';
import { FaqList } from '@/components/site/faq-list';
import { JsonLd } from '@/components/site/json-ld';
import { SectionLabel } from '@/components/ui/section-label';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { LineShowcase } from '@/components/catalog/line-showcase';
import { getCatalog, getGallery, getSettings } from '@/lib/data';
import { galleryForLine } from '@/lib/image-seo';
import { SHOWCASE } from '@/lib/showcase';
import { CATEGORIA_SEO, CIDADES_ATENDIDAS } from '@/lib/seo-content';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, metaDescription } from '@/lib/seo';
import { whatsappUrl } from '@/lib/whatsapp';
import { pluralize } from '@/lib/text';

type Params = Promise<{ categoria: string }>;

export async function generateStaticParams() {
  try {
    const { categorias } = await getCatalog();
    return categorias.map((c) => ({ categoria: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categoria } = await params;
  const { categorias } = await getCatalog();
  const cat = categorias.find((c) => c.slug === categoria);
  if (!cat) return {};
  const seo = CATEGORIA_SEO[cat.slug];
  const title = seo?.title ?? `${cat.nome} de Concreto`;
  const description =
    seo?.metaDescription ??
    metaDescription(
      cat.descricao ??
        `${cat.nome} de concreto direto da fábrica Art Terra em Pinheiral/RJ. Medidas, cores e orçamento pelo WhatsApp.`,
    );
  return {
    title: { absolute: `${title} | Art Terra` },
    description,
    alternates: { canonical: `/catalogo/${cat.slug}` },
    openGraph: {
      title: `${title} | Art Terra`,
      description,
      url: `/catalogo/${cat.slug}`,
      ...(cat.imagem_capa_url ? { images: [{ url: cat.imagem_capa_url }] } : {}),
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { categoria } = await params;
  await searchParams;
  const [settings, catalog, galeria] = await Promise.all([
    getSettings(),
    getCatalog(),
    getGallery(),
  ]);
  const cat = catalog.categorias.find((c) => c.slug === categoria);
  if (!cat) notFound();

  const seo = CATEGORIA_SEO[cat.slug];
  const produtos = catalog.produtos.filter((p) => p.categoria.slug === cat.slug);
  const h1 = seo?.h1 ?? cat.nome;
  const intro = seo?.intro ?? cat.descricao;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: 'Catálogo', path: '/catalogo' },
          { name: cat.nome, path: `/catalogo/${cat.slug}` },
        ])}
      />
      <JsonLd data={itemListJsonLd(produtos)} />
      {seo?.faqs.length ? <JsonLd data={faqJsonLd(seo.faqs)} /> : null}

      <header className="concrete-grain bg-brand-green relative overflow-hidden text-white">
        <span aria-hidden className="bg-brand-orange absolute right-0 bottom-0 h-2 w-28 sm:w-56" />
        <div className="container-site py-7 sm:py-12">
          <nav aria-label="Você está aqui" className="text-sm text-white/75">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-white hover:underline">
                  Início
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/catalogo" className="hover:text-white hover:underline">
                  Catálogo
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-white">
                {cat.nome}
              </li>
            </ol>
          </nav>
          <h1 className="mt-3 max-w-3xl text-[1.85rem] leading-tight font-extrabold sm:text-5xl">
            {h1}
          </h1>
          <p className="mt-2 text-white/80 sm:text-lg">
            {produtos.length} {pluralize(produtos.length, 'modelo', 'modelos')} · fábrica em
            Pinheiral/RJ
          </p>
        </div>
      </header>

      {SHOWCASE[cat.slug] ? (
        <LineShowcase
          config={SHOWCASE[cat.slug]!}
          produtos={produtos}
          galeria={galleryForLine(galeria, cat.slug)}
        />
      ) : null}

      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogBrowser
          categorias={catalog.categorias}
          produtos={catalog.produtos}
          whatsapp={settings.whatsapp}
          pdfUrl={settings.catalogo_pdf_url}
          categoria={cat.slug}
        />
      </Suspense>

      {/* Editorial content below the grid: phones get the products first, Google still gets the copy */}
      <section className="border-line border-t bg-white" aria-labelledby="sobre-linha">
        <div className="container-site grid grid-cols-1 gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <SectionLabel>Sobre a linha</SectionLabel>
            <h2
              id="sobre-linha"
              className="font-heading text-brand-green mt-2 text-2xl font-bold sm:text-3xl"
            >
              {cat.nome} Art Terra
            </h2>
            {intro ? <p className="text-muted mt-4 text-lg leading-relaxed">{intro}</p> : null}
            {seo?.usos.length ? (
              <>
                <h3 className="font-heading text-ink mt-8 text-lg font-semibold">Onde usar</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {seo.usos.map((u) => (
                    <li key={u} className="text-ink flex gap-2.5">
                      <Check className="text-brand-orange mt-0.5 size-5 shrink-0" aria-hidden />
                      {u}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <div className="bg-offwhite mt-8 rounded-[12px] p-5">
              <p className="text-ink flex items-center gap-2 font-semibold">
                <MapPin className="text-brand-orange size-5" aria-hidden />
                Entregamos no Sul Fluminense
              </p>
              <p className="text-muted mt-1.5 text-sm leading-relaxed">
                {CIDADES_ATENDIDAS.join(', ')} e região. Consulte o frete para outras cidades.
              </p>
            </div>
            <Button asChild variant="whatsapp" size="lg" className="mt-8 w-full sm:w-auto">
              <a
                href={whatsappUrl(
                  settings.whatsapp,
                  `Olá! Vim pelo site e gostaria de um orçamento da linha ${cat.nome}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon />
                Orçamento de {cat.nome.toLowerCase()}
              </a>
            </Button>
          </div>
          {seo?.faqs.length ? (
            <div>
              <SectionLabel>Dúvidas frequentes</SectionLabel>
              <h2 className="font-heading text-brand-green mt-2 mb-5 text-2xl font-bold sm:text-3xl">
                Perguntas sobre {cat.nome.toLowerCase()}
              </h2>
              <FaqList faqs={seo.faqs} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
