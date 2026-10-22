import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  Factory,
  MapPin,
  MessageCircle,
  Palette,
  Ruler,
  Truck,
} from 'lucide-react';
import interiorCobogo from '@/assets/site/interior-cobogo.webp';
import { ProductCard } from '@/components/catalog/product-card';
import { ProductImage } from '@/components/catalog/product-image';
import { FaqList } from '@/components/site/faq-list';
import { GalleryGrid } from '@/components/site/gallery-grid';
import { Hero } from '@/components/site/hero';
import { JsonLd } from '@/components/site/json-ld';
import { ContactDetails, LocationActions, MapEmbed } from '@/components/site/location-block';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { SectionLabel } from '@/components/ui/section-label';
import { getCatalogSafe, getGallery, getSettings } from '@/lib/data';
import { CIDADES_ATENDIDAS, HOME_FAQS } from '@/lib/seo-content';
import { faqJsonLd, localBusinessJsonLd } from '@/lib/seo';
import { floorToTen, pluralize } from '@/lib/text';
import { USOS, usosDoProduto } from '@/lib/usos';
import { DEFAULT_QUOTE_MESSAGE, whatsappUrl } from '@/lib/whatsapp';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Art Terra | Pisos, Cobogós e Bordas Atérmicas de Concreto – Pinheiral/RJ' },
  description:
    'Fábrica de pisos de concreto, cobogós, bordas atérmicas para piscina e artefatos de cimento em Pinheiral/RJ. Entrega no Sul Fluminense. Orçamento pelo WhatsApp.',
  alternates: { canonical: '/' },
};

const PASSOS = [
  {
    icon: ClipboardList,
    titulo: 'Monte sua lista',
    texto:
      'No catálogo, toque em “+ Orçar” nos produtos que você quer (cor e medida na página do produto).',
  },
  {
    icon: Ruler,
    titulo: 'Informe as quantidades',
    texto: 'Use a calculadora de peças por m² ou deixe em branco: a gente ajuda a calcular.',
  },
  {
    icon: MessageCircle,
    titulo: 'Envie pelo WhatsApp',
    texto: 'A lista vai pronta em uma mensagem. Respondemos com preço, prazo e frete.',
  },
];

export default async function HomePage() {
  const [settings, catalog, galeria] = await Promise.all([
    getSettings(),
    getCatalogSafe(),
    getGallery(),
  ]);
  const whatsappHref = whatsappUrl(settings.whatsapp, DEFAULT_QUOTE_MESSAGE);
  const modelos = floorToTen(catalog.produtos.length);
  const destaques = catalog.produtos.filter((p) => p.destaque).slice(0, 6);

  // "Where will you use it?" tiles, with a real product photo and count for each use
  const usos = USOS.map((u) => {
    const itens = catalog.produtos.filter((p) => usosDoProduto(p).includes(u.slug));
    const foto =
      itens.find((p) => p.imagem_aplicacao_url)?.imagem_aplicacao_url ??
      itens.find((p) => p.imagem_principal_url)?.imagem_principal_url ??
      null;
    return { ...u, total: itens.length, foto };
  }).filter((u) => u.total > 0);

  const motivos = [
    {
      icon: Factory,
      titulo: 'Fabricação própria',
      texto: 'Do molde à entrega, sem atravessadores.',
    },
    {
      icon: Palette,
      titulo: 'Cores e medidas',
      texto: modelos >= 10 ? `Mais de ${modelos} modelos em linha.` : 'Modelos para cada projeto.',
    },
    { icon: Ruler, titulo: 'Ajuda no cálculo', texto: 'Dizemos quantas peças a sua obra precisa.' },
    { icon: Truck, titulo: 'Entrega na região', texto: 'Obras e revendas do Sul Fluminense.' },
  ];

  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />
      <JsonLd data={faqJsonLd(HOME_FAQS)} />

      <Hero
        titulo={settings.hero_titulo}
        subtitulo={settings.hero_subtitulo}
        imagemUrl={settings.hero_imagem_url}
        whatsappHref={whatsappHref}
        modelos={modelos}
      />

      {/* --------------------------- Onde você vai usar? --------------------------- */}
      {usos.length > 0 ? (
        <section id="usos" aria-labelledby="usos-titulo" className="scroll-mt-20 py-12 sm:py-20">
          <div className="container-site">
            <SectionLabel>Comece pelo seu projeto</SectionLabel>
            <h2
              id="usos-titulo"
              className="text-brand-green mt-3 text-[1.75rem] leading-tight font-bold sm:text-[2.5rem]"
            >
              Onde você vai usar?
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {usos.map((u) => (
                <li key={u.slug}>
                  <Link
                    href={`/catalogo?uso=${u.slug}`}
                    className="group border-line hover:border-brand-green/40 hover:shadow-soft flex h-full flex-col overflow-hidden rounded-[12px] border bg-white transition-shadow"
                  >
                    <span className="bg-sand relative block aspect-[4/3] overflow-hidden">
                      <ProductImage
                        src={u.foto}
                        alt=""
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                    </span>
                    <span className="flex flex-1 flex-col p-3.5 sm:p-5">
                      <span className="font-heading text-brand-green text-base leading-tight font-bold sm:text-xl">
                        {u.titulo}
                      </span>
                      <span className="text-muted mt-1 hidden text-sm sm:block">{u.descricao}</span>
                      <span className="text-brand-orange-ink mt-auto flex items-center gap-1.5 pt-2.5 text-sm font-semibold">
                        {u.total} {pluralize(u.total, 'produto', 'produtos')}
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          aria-hidden
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ---------------------------- Linhas do catálogo ---------------------------- */}
      {catalog.categorias.length > 0 ? (
        <section
          aria-labelledby="linhas-titulo"
          className="concrete-grain bg-brand-green py-16 text-white sm:py-24"
        >
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <SectionLabel tone="dark">Linhas de produto</SectionLabel>
                <h2
                  id="linhas-titulo"
                  className="mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
                >
                  {catalog.categorias.length === 4 ? 'Quatro linhas' : 'Nossas linhas'}, uma fábrica
                </h2>
              </div>
              <Button asChild variant="outlineLight" className="hidden sm:inline-flex">
                <Link href="/catalogo">
                  Ver catálogo completo
                  <ArrowRight />
                </Link>
              </Button>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {catalog.categorias.map((c, i) => (
                <li key={c.id}>
                  <Link
                    href={`/catalogo/${c.slug}`}
                    className="group bg-brand-green-dark shadow-lift relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[12px]"
                  >
                    <ProductImage
                      src={c.imagem_capa_url}
                      alt=""
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="from-brand-green-dark via-brand-green-dark/45 absolute inset-0 bg-gradient-to-t to-transparent"
                    />
                    <span className="relative p-3.5 sm:p-5">
                      <span className="font-label text-brand-orange flex items-center gap-2 text-lg tracking-[0.14em]">
                        <span aria-hidden className="bg-brand-orange inline-block size-2.5" />
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-heading mt-1 block text-lg leading-tight font-bold sm:text-2xl">
                        {c.nome}
                      </span>
                      <span className="mt-1.5 flex items-center justify-between gap-2 text-xs text-white/85 sm:mt-2 sm:text-sm">
                        {c.total} {pluralize(c.total, 'modelo', 'modelos')}
                        <span className="group-hover:bg-brand-orange group-hover:text-brand-green-dark hidden size-10 shrink-0 place-items-center rounded-full bg-white/12 transition-colors sm:grid">
                          <ArrowUpRight className="size-5" aria-hidden />
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ------------------------------- Destaques ------------------------------- */}
      {destaques.length > 0 ? (
        <section aria-labelledby="destaques-titulo" className="py-14 sm:py-24">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <SectionLabel>Mais pedidos</SectionLabel>
                <h2
                  id="destaques-titulo"
                  className="text-brand-green mt-3 text-[1.75rem] leading-tight font-bold sm:text-[2.5rem]"
                >
                  Peças em destaque
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="group font-heading text-brand-green inline-flex min-h-11 items-center gap-2 font-semibold"
              >
                <span className="border-brand-orange border-b-2 pb-0.5">Ver catálogo completo</span>
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-3">
              {destaques.map((p) => (
                <li key={p.id}>
                  <ProductCard produto={p} whatsapp={settings.whatsapp} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ---------------------------- Como pedir orçamento ---------------------------- */}
      <section aria-labelledby="passos-titulo" className="bg-sand py-14 sm:py-20">
        <div className="container-site">
          <SectionLabel>Simples assim</SectionLabel>
          <h2
            id="passos-titulo"
            className="text-brand-green mt-3 text-[1.75rem] leading-tight font-bold sm:text-[2.5rem]"
          >
            Como pedir seu orçamento
          </h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
            {PASSOS.map(({ icon: Icon, titulo, texto }, i) => (
              <li
                key={titulo}
                className="flex gap-4 rounded-[12px] bg-white p-5 sm:p-6 md:flex-col"
              >
                <span className="bg-brand-green relative grid size-12 shrink-0 place-items-center rounded-[10px] text-white">
                  <Icon className="size-6" aria-hidden />
                  <span className="font-label bg-brand-orange text-brand-green-dark absolute -top-2 -right-2 grid size-6 place-items-center rounded-full text-sm">
                    {i + 1}
                  </span>
                </span>
                <span>
                  <h3 className="text-brand-green text-lg font-semibold">{titulo}</h3>
                  <p className="text-muted mt-1 leading-relaxed">{texto}</p>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/catalogo">
                Montar minha lista
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Prefiro falar direto
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------- Sobre ------------------------------- */}
      <section id="sobre" aria-labelledby="sobre-titulo" className="py-16 sm:py-24">
        <div className="container-site">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <SectionLabel>Fábrica, não revenda</SectionLabel>
              <h2
                id="sobre-titulo"
                className="text-brand-green mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
              >
                Fábrica de artefatos de concreto em Pinheiral/RJ
              </h2>
              <p className="text-ink/85 mt-5 text-lg leading-relaxed">
                A Art Terra produz pisos de concreto, cobogós, bordas atérmicas para piscina e
                artefatos de cimento na própria fábrica, no Sul Fluminense. Você fala direto com
                quem fabrica: orientação técnica, ajuda para calcular a obra e entrega para obras e
                revendas da região.
              </p>
              <Link
                href="/sobre"
                className="group font-heading text-brand-green mt-6 inline-flex min-h-11 items-center gap-2 font-semibold"
              >
                <span className="border-brand-orange border-b-2 pb-0.5">Conheça a fábrica</span>
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
            <div className="relative">
              <div
                aria-hidden
                className="bg-brand-orange absolute -right-3 -bottom-3 hidden h-2/3 w-2/3 sm:block"
              />
              <div className="shadow-lift relative aspect-[3/2] overflow-hidden rounded-[12px]">
                <Image
                  src={interiorCobogo}
                  alt="Cozinha integrada com divisória de cobogós brancos de concreto"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {motivos.map(({ icon: Icon, titulo, texto }) => (
              <li key={titulo} className="border-line rounded-[12px] border bg-white p-4 sm:p-6">
                <span className="bg-brand-orange/15 text-brand-orange-ink grid size-11 place-items-center rounded-[10px]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-brand-green mt-3 text-base font-semibold sm:text-lg">
                  {titulo}
                </h3>
                <p className="text-muted mt-1 text-sm leading-relaxed sm:text-base">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------- Projetos realizados ---------------------------- */}
      {galeria.length > 0 ? (
        <section aria-labelledby="projetos-titulo" className="py-16 sm:py-24">
          <div className="container-site">
            <SectionLabel>Projetos realizados</SectionLabel>
            <h2
              id="projetos-titulo"
              className="text-brand-green mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
            >
              Nossas peças em obra
            </h2>
            <p className="text-muted mt-3 max-w-2xl text-lg">
              Toque em uma foto para ampliar e ver como as peças ficam aplicadas.
            </p>
            <div className="mt-10">
              <GalleryGrid items={galeria} />
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------ FAQ + região ------------------------------ */}
      <section aria-labelledby="faq-titulo" className="bg-offwhite py-14 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <SectionLabel>Dúvidas frequentes</SectionLabel>
            <h2
              id="faq-titulo"
              className="text-brand-green mt-3 text-[1.75rem] leading-tight font-bold sm:text-[2.5rem]"
            >
              Perguntas sobre pedidos e entrega
            </h2>
            <div className="border-line mt-6 rounded-[12px] border bg-white p-5">
              <p className="text-ink flex items-center gap-2 font-semibold">
                <MapPin className="text-brand-orange size-5" aria-hidden />
                Cidades atendidas
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {CIDADES_ATENDIDAS.map((c) => (
                  <li key={c} className="bg-sand text-ink rounded-full px-3 py-1 text-sm">
                    {c}
                  </li>
                ))}
              </ul>
              <p className="text-muted mt-3 text-sm">
                Outras cidades: consulte o frete pelo WhatsApp.
              </p>
            </div>
          </div>
          <FaqList faqs={HOME_FAQS} />
        </div>
      </section>

      {/* -------------------------------- Localização -------------------------------- */}
      <section
        id="localizacao"
        aria-labelledby="local-titulo"
        className="border-line border-t bg-white py-16 sm:py-24"
      >
        <div className="container-site grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <MapEmbed />
          <div className="flex flex-col justify-center">
            <SectionLabel>Onde estamos</SectionLabel>
            <h2
              id="local-titulo"
              className="text-brand-green mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
            >
              Venha conhecer a fábrica
            </h2>
            <p className="text-muted mt-3 mb-7 text-lg">
              Veja as peças de perto, tire dúvidas e leve as medidas da sua obra.
            </p>
            <ContactDetails settings={settings} />
            <div className="mt-8">
              <LocationActions settings={settings} />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------- CTA final --------------------------------- */}
      <section
        aria-labelledby="cta-titulo"
        className="concrete-grain bg-brand-green-dark relative overflow-hidden py-16 text-white sm:py-20"
      >
        <span aria-hidden className="bg-brand-orange absolute top-0 left-0 h-2 w-28 sm:w-56" />
        <div className="container-site flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 id="cta-titulo" className="text-3xl leading-tight font-bold sm:text-[2.5rem]">
              Vamos orçar a sua obra?
            </h2>
            <p className="mt-3 text-lg text-white/85">
              Envie as medidas e o modelo desejado. Respondemos com preço, prazo e frete.
            </p>
          </div>
          <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Falar com a fábrica
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
