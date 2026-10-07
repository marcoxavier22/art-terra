import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/catalog/product-card';
import { ProductGallery } from '@/components/catalog/product-gallery';
import { QuoteBuilder } from '@/components/catalog/quote-builder';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { JsonLd } from '@/components/site/json-ld';
import type { LightboxImage } from '@/components/site/lightbox';
import { SectionLabel } from '@/components/ui/section-label';
import { getCatalog, getCatalogSafe, getProduct, getSettings } from '@/lib/data';
import { breadcrumbJsonLd, metaDescription, productJsonLd } from '@/lib/seo';
import { faceLabel } from '@/lib/text';
import type { Produto } from '@/lib/types';

export const revalidate = 3600;
export const dynamicParams = true;

type Params = Promise<{ categoria: string; slug: string }>;

export async function generateStaticParams() {
  const { produtos } = await getCatalogSafe();
  return produtos.map((p) => ({ categoria: p.categoria.slug, slug: p.slug }));
}

function fallbackDescription(produto: Produto): string {
  const medidas = produto.medidas.map((m) => m.valor).join(', ');
  return `${produto.nome} da linha ${produto.categoria.nome} da Art Terra${medidas ? `, nas medidas ${medidas}` : ''}. Fabricação própria em Pinheiral/RJ. Peça seu orçamento.`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categoria, slug } = await params;
  const produto = await getProduct(categoria, slug).catch(() => null);
  if (!produto) return { title: 'Produto não encontrado', robots: { index: false } };
  const description = metaDescription(produto.descricao || fallbackDescription(produto));
  const path = `/catalogo/${produto.categoria.slug}/${produto.slug}`;
  const image = produto.imagem_principal_url ?? produto.imagem_aplicacao_url;
  return {
    title: `${produto.nome} — ${produto.categoria.nome}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title: `${produto.nome} | Art Terra`,
      description,
      url: path,
      ...(image ? { images: [{ url: image, alt: produto.nome }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${produto.nome} | Art Terra`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { categoria, slug } = await params;
  const [settings, catalog] = await Promise.all([getSettings(), getCatalog()]);
  const produto = catalog.produtos.find((p) => p.slug === slug && p.categoria.slug === categoria);
  if (!produto) notFound();

  const images = [
    produto.imagem_principal_url
      ? { src: produto.imagem_principal_url, alt: produto.nome, caption: produto.nome }
      : null,
    produto.imagem_aplicacao_url
      ? {
          src: produto.imagem_aplicacao_url,
          alt: `${produto.nome} aplicado em obra`,
          caption: `${produto.nome} — aplicação`,
        }
      : null,
    ...produto.imagens_extras.map((src, i) => ({
      src,
      alt: `${produto.nome} — foto ${i + 1}`,
      caption: `${produto.nome} — foto adicional ${i + 1}`,
    })),
  ].filter((v) => v !== null) satisfies LightboxImage[];

  const face = faceLabel(produto.face);
  const specs: { label: string; value: React.ReactNode }[] = [];
  if (produto.medidas.length > 0) {
    specs.push({
      label: produto.medidas.length > 1 ? 'Medidas' : 'Medida',
      value: (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {produto.medidas.map((m) => (
            <li key={`${m.rotulo}-${m.valor}`} className="tabular-nums">
              {m.rotulo ? <span className="font-semibold">{m.rotulo}: </span> : null}
              {m.valor}
            </li>
          ))}
        </ul>
      ),
    });
  }
  if (produto.rendimento) specs.push({ label: 'Rendimento', value: produto.rendimento });
  if (face) {
    specs.push({
      label: 'Face',
      value: produto.observacao_face ? `${face} — ${produto.observacao_face}` : face,
    });
  }
  if (produto.aplicacao) specs.push({ label: 'Aplicação recomendada', value: produto.aplicacao });
  if (produto.observacoes) specs.push({ label: 'Observações', value: produto.observacoes });

  const relacionados = catalog.produtos
    .filter((p) => p.categoria_id === produto.categoria_id && p.id !== produto.id)
    .slice(0, 4);

  const crumbs = [
    { name: 'Início', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
    { name: produto.categoria.nome, path: `/catalogo?cat=${produto.categoria.slug}` },
    { name: produto.nome, path: `/catalogo/${produto.categoria.slug}/${produto.slug}` },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(produto)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <div className="container-site pt-4 pb-16 sm:pt-6 sm:pb-24">
        <Breadcrumb
          items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { name: c.name } : c))}
        />

        <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={images} nome={produto.nome} />
          </div>

          <div>
            <SectionLabel>{produto.categoria.nome}</SectionLabel>
            <h1 className="text-brand-green mt-3 text-[2rem] leading-tight font-extrabold sm:text-[2.6rem]">
              {produto.nome}
            </h1>
            {produto.descricao ? (
              <p className="text-ink/85 mt-4 text-lg leading-relaxed whitespace-pre-line">
                {produto.descricao}
              </p>
            ) : null}

            {specs.length > 0 ? (
              <section aria-labelledby="specs-titulo" className="mt-8">
                <h2
                  id="specs-titulo"
                  className="font-heading text-brand-green text-lg font-semibold"
                >
                  Especificações
                </h2>
                <dl className="border-line mt-3 overflow-hidden rounded-[12px] border bg-white">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="border-line grid gap-1 border-b px-4 py-3.5 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:gap-4"
                    >
                      <dt className="text-muted text-sm font-semibold">{spec.label}</dt>
                      <dd className="text-ink">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <div className="mt-8">
              <QuoteBuilder
                nome={produto.nome}
                whatsapp={settings.whatsapp}
                cores={produto.cores}
                medidas={produto.medidas}
                piecesPerM2={produto.rendimento_pecas_m2}
              />
            </div>
          </div>
        </div>

        {relacionados.length > 0 ? (
          <section aria-labelledby="relacionados-titulo" className="mt-20">
            <SectionLabel>{produto.categoria.nome}</SectionLabel>
            <h2
              id="relacionados-titulo"
              className="text-brand-green mt-3 text-2xl font-bold sm:text-3xl"
            >
              Outros produtos da linha
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {relacionados.map((p) => (
                <li key={p.id}>
                  <ProductCard produto={p} whatsapp={settings.whatsapp} showCategory={false} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
