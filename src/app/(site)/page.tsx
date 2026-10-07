import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Factory,
  HardHat,
  Palette,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import interiorCobogo from '@/assets/site/interior-cobogo.webp';
import { ProductCard } from '@/components/catalog/product-card';
import { ProductImage } from '@/components/catalog/product-image';
import { GalleryGrid } from '@/components/site/gallery-grid';
import { Hero } from '@/components/site/hero';
import { JsonLd } from '@/components/site/json-ld';
import { ContactDetails, LocationActions, MapEmbed } from '@/components/site/location-block';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { SectionLabel } from '@/components/ui/section-label';
import { getCatalogSafe, getGallery, getSettings } from '@/lib/data';
import { localBusinessJsonLd } from '@/lib/seo';
import { floorToTen, pluralize } from '@/lib/text';
import { DEFAULT_QUOTE_MESSAGE, whatsappUrl } from '@/lib/whatsapp';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: 'Art Terra | Fábrica de Pisos e Cobogós de Concreto em Pinheiral/RJ' },
  description:
    'Fábrica de pisos de concreto, cobogós, bordas atérmicas para piscina e artefatos de cimento em Pinheiral/RJ. Peça seu orçamento pelo WhatsApp.',
  alternates: { canonical: '/' },
};

const DIFERENCIAIS = [
  {
    icon: ShieldCheck,
    titulo: 'Durabilidade',
    texto: 'Peças cimentícias de alta resistência, feitas para enfrentar sol, chuva e uso intenso.',
  },
  {
    icon: Sparkles,
    titulo: 'Design Atemporal',
    texto: 'Formas e texturas que atravessam o tempo, do minimalismo à rusticidade elegante.',
  },
  {
    icon: Factory,
    titulo: 'Fabricação Própria',
    texto: 'Produção na nossa fábrica em Pinheiral/RJ, com controle de qualidade em cada peça.',
  },
  {
    icon: Palette,
    titulo: 'Cores e Acabamentos',
    texto: 'Diversas cores e texturas para combinar com qualquer projeto ou paisagismo.',
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

  const motivos = [
    {
      icon: Factory,
      titulo: 'Fabricação própria',
      texto: 'Do molde à entrega, sem atravessadores.',
    },
    {
      icon: Palette,
      titulo: 'Variedade de acabamentos',
      texto:
        modelos >= 10
          ? `Mais de ${modelos} modelos em linha.`
          : 'Modelos para cada tipo de projeto.',
    },
    {
      icon: Ruler,
      titulo: 'Atendimento personalizado',
      texto: 'Ajudamos a calcular a sua obra.',
    },
    {
      icon: Truck,
      titulo: 'Entrega para obras e revendas',
      texto: 'Atendemos Sul Fluminense e região.',
    },
  ];

  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />

      <Hero
        titulo={settings.hero_titulo}
        subtitulo={settings.hero_subtitulo}
        imagemUrl={settings.hero_imagem_url}
        whatsappHref={whatsappHref}
        modelos={modelos}
      />

      {/* ------------------------------- Sobre ------------------------------- */}
      <section id="sobre" aria-labelledby="sobre-titulo" className="py-16 sm:py-24">
        <div className="container-site">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <SectionLabel>Sobre a Art Terra</SectionLabel>
              <h2
                id="sobre-titulo"
                className="text-brand-green mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
              >
                O concreto como expressão de solidez e sofisticação
              </h2>
              <p className="text-ink/85 mt-5 text-lg leading-relaxed">
                Mais do que um material de construção, o concreto é uma expressão de solidez e
                aparência. Suas formas e texturas atravessam o tempo, trazendo equilíbrio entre
                funcionalidade e estética. Revestimentos, pisos, bordas de piscina, cobogós e vasos
                unem resistência e beleza, criando espaços marcantes que nunca saem de moda.
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

          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {DIFERENCIAIS.map(({ icon: Icon, titulo, texto }) => (
              <li
                key={titulo}
                className="border-line shadow-soft rounded-[12px] border bg-white p-6"
              >
                <span className="bg-brand-orange/15 text-brand-orange-ink grid size-12 place-items-center rounded-[10px]">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="text-brand-green mt-4 text-lg font-semibold">{titulo}</h3>
                <p className="text-muted mt-1.5 leading-relaxed">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------- Linhas do catálogo ---------------------------- */}
      {catalog.categorias.length > 0 ? (
        <section
          aria-labelledby="linhas-titulo"
          className="concrete-grain bg-brand-green py-16 text-white sm:py-24"
        >
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <SectionLabel tone="dark">Catálogo 2025</SectionLabel>
                <h2
                  id="linhas-titulo"
                  className="mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
                >
                  {catalog.categorias.length === 4 ? 'Quatro linhas' : 'Nossas linhas'}, uma fábrica
                </h2>
              </div>
              <Button asChild variant="outlineLight">
                <Link href="/catalogo">
                  Ver catálogo completo
                  <ArrowRight />
                </Link>
              </Button>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {catalog.categorias.map((c, i) => (
                <li key={c.id}>
                  <Link
                    href={`/catalogo?cat=${c.slug}`}
                    className="group bg-brand-green-dark shadow-lift relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[12px] sm:aspect-[4/5]"
                  >
                    <ProductImage
                      src={c.imagem_capa_url}
                      alt=""
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="from-brand-green-dark via-brand-green-dark/45 absolute inset-0 bg-gradient-to-t to-transparent"
                    />
                    <span className="relative p-5">
                      <span className="font-label text-brand-orange flex items-center gap-2 text-lg tracking-[0.14em]">
                        <span aria-hidden className="bg-brand-orange inline-block size-2.5" />
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-heading mt-1 block text-2xl leading-tight font-bold">
                        {c.nome}
                      </span>
                      <span className="mt-2 flex items-center justify-between gap-3 text-sm text-white/85">
                        {c.total} {pluralize(c.total, 'modelo disponível', 'modelos disponíveis')}
                        <span className="group-hover:bg-brand-orange group-hover:text-brand-green-dark grid size-10 shrink-0 place-items-center rounded-full bg-white/12 transition-colors">
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
        <section aria-labelledby="destaques-titulo" className="py-16 sm:py-24">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <SectionLabel>Destaques</SectionLabel>
                <h2
                  id="destaques-titulo"
                  className="text-brand-green mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
                >
                  Peças em destaque
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="group font-heading text-brand-green inline-flex min-h-11 items-center gap-2 font-semibold"
              >
                <span className="border-brand-orange border-b-2 pb-0.5">Ver todos os produtos</span>
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {destaques.map((p) => (
                <li key={p.id}>
                  <ProductCard produto={p} whatsapp={settings.whatsapp} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ----------------------------- Por que escolher ----------------------------- */}
      <section aria-labelledby="motivos-titulo" className="bg-sand py-16 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionLabel>Por que escolher a Art Terra</SectionLabel>
            <h2
              id="motivos-titulo"
              className="text-brand-green mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
            >
              Fábrica, não revenda
            </h2>
            <p className="text-ink/85 mt-5 text-lg leading-relaxed">
              Você fala direto com quem produz: atendimento de fábrica, sem atravessadores, e a
              orientação de quem conhece o material.
            </p>
            <Button asChild variant="green" size="lg" className="mt-7">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <HardHat />
                Falar sobre a minha obra
              </a>
            </Button>
          </div>
          <ol className="border-line bg-line grid gap-px overflow-hidden rounded-[12px] border sm:grid-cols-2">
            {motivos.map(({ icon: Icon, titulo, texto }, i) => (
              <li key={titulo} className="bg-white p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <Icon className="text-brand-green size-7" aria-hidden />
                  <span className="font-label text-brand-orange-ink flex items-center gap-2 text-xl tracking-[0.12em]">
                    <span aria-hidden className="bg-brand-orange inline-block size-2" />
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-brand-green mt-4 text-lg font-semibold">{titulo}</h3>
                <p className="text-muted mt-1 leading-relaxed">{texto}</p>
              </li>
            ))}
          </ol>
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

      {/* -------------------------------- Localização -------------------------------- */}
      <section
        id="localizacao"
        aria-labelledby="local-titulo"
        className="border-line border-t bg-white py-16 sm:py-24"
      >
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-14">
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
