import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Factory,
  Footprints,
  Palette,
  ShieldCheck,
  Sparkles,
  Sun,
  Waves,
} from 'lucide-react';
import galeriaVaranda from '@/assets/site/galeria-varanda.webp';
import interiorCobogo from '@/assets/site/interior-cobogo.webp';
import { JsonLd } from '@/components/site/json-ld';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { SectionLabel } from '@/components/ui/section-label';
import { getSettings } from '@/lib/data';
import { breadcrumbJsonLd } from '@/lib/seo';
import { DEFAULT_QUOTE_MESSAGE, whatsappUrl } from '@/lib/whatsapp';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Sobre a fábrica de artefatos de concreto',
  description:
    'Conheça a Art Terra: fábrica de pisos, cobogós, bordas atérmicas e artefatos de concreto em Pinheiral/RJ, atendendo obras e revendas do Sul Fluminense.',
  alternates: { canonical: '/sobre' },
};

const DIFERENCIAIS = [
  {
    icon: ShieldCheck,
    titulo: 'Durabilidade',
    texto:
      'Peças pensadas para alto fluxo e variações climáticas, com resistência comprovada em obra.',
  },
  {
    icon: Sparkles,
    titulo: 'Design atemporal',
    texto: 'Formas que se reinventam e permanecem relevantes, independentemente das tendências.',
  },
  {
    icon: Factory,
    titulo: 'Fabricação própria',
    texto: 'Produção na nossa unidade em Pinheiral/RJ, com atendimento direto de fábrica.',
  },
  {
    icon: Palette,
    titulo: 'Cores e acabamentos',
    texto: 'Natural, branco, chocolate, cinza, preto, madeirados e mais — sob consulta.',
  },
];

export default async function SobrePage() {
  const settings = await getSettings();
  const whatsappHref = whatsappUrl(settings.whatsapp, DEFAULT_QUOTE_MESSAGE);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: 'Sobre', path: '/sobre' },
        ])}
      />

      {/* Hero */}
      <header className="bg-brand-green-dark relative isolate flex min-h-[46vh] items-end overflow-hidden">
        <Image
          src={interiorCobogo}
          alt="Ambiente interno com divisória de cobogós brancos de concreto"
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          className="-z-20 object-cover object-[30%_50%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(31_55_33/0.94)_0%,rgb(31_55_33/0.8)_50%,rgb(31_55_33/0.4)_100%)]"
        />
        <div className="container-site py-12 sm:py-16">
          <SectionLabel tone="dark">Sobre nós</SectionLabel>
          <h1 className="mt-4 max-w-3xl text-[2rem] leading-[1.1] font-extrabold text-white sm:text-5xl">
            Solidez, sofisticação e aparência em cada peça
          </h1>
        </div>
      </header>

      {/* Texto institucional */}
      <section aria-labelledby="historia-titulo" className="py-16 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h2 id="historia-titulo" className="sr-only">
              Nossa história
            </h2>
            <div className="text-ink/85 space-y-5 text-lg leading-relaxed">
              <p>
                O concreto é mais do que um material de construção — é uma expressão de solidez,
                sofisticação e aparência. Suas formas e texturas atravessam o tempo, trazendo um
                equilíbrio perfeito entre funcionalidade e estética. Peças cimentícias, como
                revestimentos, pisos, bordas de piscina, cobogós e vasos, unem resistência e beleza,
                criando espaços marcantes que nunca saem de moda.
              </p>
              <p>
                Com acabamento refinado e design que se adapta a diferentes estilos, essas peças
                transformam ambientes internos e externos, proporcionando leveza sem abrir mão da
                durabilidade. Seja no minimalismo contemporâneo ou na rusticidade elegante, o
                concreto imprime personalidade a cada projeto.
              </p>
              <p>
                Na Art Terra, fabricamos cada item na nossa unidade em Pinheiral/RJ, atendendo
                obras, construtoras, paisagistas e revendas de toda a região Sul Fluminense.
              </p>
            </div>
            <blockquote className="border-brand-orange font-heading text-brand-green mt-8 border-l-4 pl-5 text-xl leading-snug font-semibold sm:text-2xl">
              Sua atemporalidade é a capacidade de se reinventar, mantendo-se relevante
              independentemente das tendências.
            </blockquote>
            <Button asChild size="lg" className="mt-9 w-full sm:w-auto">
              <Link href="/catalogo">
                Ver o catálogo completo
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="relative lg:pt-2">
            <div
              aria-hidden
              className="bg-brand-green absolute -top-3 -left-3 hidden h-1/2 w-1/2 sm:block lg:top-0"
            />
            <div className="shadow-lift relative aspect-[4/5] overflow-hidden rounded-[12px]">
              <Image
                src={galeriaVaranda}
                alt="Varanda externa com piso de concreto em grandes placas"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section aria-labelledby="diferenciais-titulo" className="bg-sand py-16 sm:py-24">
        <div className="container-site">
          <SectionLabel>O que nos move</SectionLabel>
          <h2
            id="diferenciais-titulo"
            className="text-brand-green mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
          >
            Nossos diferenciais
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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

      {/* Linha Atérmica */}
      <section
        aria-labelledby="atermica-titulo"
        className="concrete-grain bg-brand-green py-16 text-white sm:py-24"
      >
        <div className="container-site grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <SectionLabel tone="dark">Linha Atérmica</SectionLabel>
            <h2
              id="atermica-titulo"
              className="mt-4 text-3xl leading-tight font-bold sm:text-[2.5rem]"
            >
              Conforto térmico para a área da piscina
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/88">
              A linha Atérmica de pisos, bordas e acessórios para piscinas foi desenvolvida para
              oferecer conforto e segurança em áreas externas. Sua composição especial permite uma
              menor absorção de calor em comparação com outras superfícies, mantendo a temperatura
              mais amena mesmo sob exposição direta ao sol. Além de suavizar a sensação térmica e
              reduzir o efeito conhecido como ilha de calor, sua textura levemente porosa garante
              aderência e propriedades relaxantes, proporcionando mais segurança ao caminhar, mesmo
              com os pés molhados.
            </p>
            <Button asChild variant="outlineLight" size="lg" className="mt-8 w-full sm:w-auto">
              <Link href="/catalogo?cat=atermicos">
                Ver a Linha Atérmica
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <ul className="grid content-center gap-3">
            {[
              { icon: Sun, texto: 'Menor absorção de calor sob sol direto' },
              { icon: Footprints, texto: 'Textura levemente porosa, com mais aderência' },
              { icon: Waves, texto: 'Bordas, grelhas e pisos para o entorno da piscina' },
            ].map(({ icon: Icon, texto }) => (
              <li
                key={texto}
                className="flex items-center gap-4 rounded-[12px] border border-white/15 bg-white/[0.06] p-5"
              >
                <Icon className="text-brand-orange size-7 shrink-0" aria-hidden />
                <span className="font-heading text-lg font-semibold">{texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="sobre-cta" className="py-16 sm:py-20">
        <div className="container-site border-line shadow-soft flex flex-col items-start gap-6 rounded-[12px] border bg-white p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 id="sobre-cta" className="text-brand-green text-2xl font-bold sm:text-3xl">
              Tem um projeto em andamento?
            </h2>
            <p className="text-muted mt-2 text-lg">
              Conte o que você precisa. Ajudamos a escolher o modelo e a calcular a quantidade.
            </p>
          </div>
          <Button asChild variant="whatsapp" size="lg" className="w-full shrink-0 sm:w-auto">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Conversar no WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
