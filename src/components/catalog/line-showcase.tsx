'use client';
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ListPlus,
  Minus,
  Plus,
} from 'lucide-react';
import { productImageAlt, productImages } from '@/lib/image-seo';
import { defaultUnidade } from '@/lib/quote';
import { BLUR_DATA_URL } from '@/lib/site';
import { parseFootprint, rowLength, type ShowcaseConfig } from '@/lib/showcase';
import { faceLabel, pluralize } from '@/lib/text';
import type { GaleriaItem, Produto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useQuote } from '@/components/quote/quote-context';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/section-label';
import { productHref } from './product-card';
import { ProductImage } from './product-image';

const Lightbox = dynamic(() => import('@/components/site/lightbox').then((m) => m.Lightbox), {
  ssr: false,
});

function quoteRef(p: Produto) {
  return {
    produtoId: p.id,
    nome: p.nome,
    href: productHref(p),
    imagem: p.imagem_principal_url ?? p.imagem_aplicacao_url,
    cor: null,
    medida: null,
  };
}

/** "Adicionar [modelo] ao orçamento" — turns into a link to the list once added. */
function AddModelButton({ produto, className }: { produto: Produto; className?: string }) {
  const quote = useQuote();
  const inList = quote.ready && quote.has(produto.id);
  if (inList) {
    return (
      <Button asChild variant="outline" size="lg" className={cn('w-full', className)}>
        <Link href="/orcamento">
          <Check />
          {produto.nome} está na lista · ver
        </Link>
      </Button>
    );
  }
  return (
    <Button
      type="button"
      size="lg"
      className={cn('h-auto w-full py-3 whitespace-normal', className)}
      onClick={() =>
        quote.add({ ...quoteRef(produto), quantidade: null, unidade: defaultUnidade(produto) })
      }
    >
      <ListPlus />
      Adicionar {produto.nome} ao orçamento
    </Button>
  );
}

function SectionHead({ config, total }: { config: ShowcaseConfig; total: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        <SectionLabel>{config.eyebrow}</SectionLabel>
        <h2 className="font-heading text-brand-green mt-2 text-[1.5rem] leading-tight font-bold sm:text-3xl">
          {config.title}
        </h2>
        <p className="text-muted mt-2 sm:text-lg">{config.intro}</p>
      </div>
      <a
        href="#lista-produtos"
        className="text-brand-green inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
      >
        Ver todos os {total} {pluralize(total, 'modelo', 'modelos')}
        <ArrowDown className="size-4" aria-hidden />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Models: pick a model, swipe between product photo, applied photo and real projects          */
/* ------------------------------------------------------------------------------------------ */

interface Slide {
  src: string;
  alt: string;
  label: string;
}

function SlideViewer({ slides, nome }: { slides: Slide[]; nome: string }) {
  const track = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [zoom, setZoom] = React.useState<number | null>(null);

  // back to the first photo whenever the model changes
  React.useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    setActive(0);
  }, [nome]);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="bg-sand relative overflow-hidden rounded-[12px]">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
          }}
          className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          aria-roledescription="carrossel"
          aria-label={`Fotos de ${nome}`}
        >
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setZoom(i)}
              aria-label={`Ampliar: ${s.alt}`}
              className="relative h-full w-full shrink-0 snap-center"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </button>
          ))}
        </div>
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              className="text-brand-green shadow-soft absolute top-1/2 left-2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 disabled:opacity-0 sm:grid"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={() => go(active + 1)}
              disabled={active === slides.length - 1}
              className="text-brand-green shadow-soft absolute top-1/2 right-2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 disabled:opacity-0 sm:grid"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {/* segmented control doubles as the slide indicator */}
      <div
        role="tablist"
        aria-label="Escolher foto"
        className="no-scrollbar mt-3 flex gap-2 overflow-x-auto"
      >
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => go(i)}
            className={cn(
              'font-heading min-h-10 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition-colors',
              active === i
                ? 'border-brand-green bg-brand-green text-white'
                : 'border-line text-brand-green bg-white',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {zoom !== null ? (
        <Lightbox
          images={slides.map((s) => ({ src: s.src, alt: s.alt, caption: `${nome}: ${s.label}` }))}
          index={zoom}
          onIndexChange={setZoom}
          onClose={() => setZoom(null)}
        />
      ) : null}
    </div>
  );
}

function ModelsShowcase({
  config,
  produtos,
  galeria,
  total,
}: {
  config: ShowcaseConfig;
  produtos: Produto[];
  galeria: GaleriaItem[];
  total: number;
}) {
  const ordered = React.useMemo(() => {
    const withPhoto = produtos.filter((p) => p.imagem_principal_url);
    const featured = (config.featured ?? [])
      .map((slug) => withPhoto.find((p) => p.slug === slug))
      .filter((p): p is Produto => Boolean(p));
    return [...featured, ...withPhoto.filter((p) => !featured.includes(p))];
  }, [produtos, config.featured]);

  const [selectedId, setSelectedId] = React.useState(ordered[0]?.id);
  const selected = ordered.find((p) => p.id === selectedId) ?? ordered[0];
  if (!selected) return null;

  const slides: Slide[] = [
    ...productImages(selected).map((img) => ({
      src: img.src,
      alt: img.alt,
      label: img.kind === 'peca' ? 'Peça' : img.kind === 'aplicacao' ? 'Aplicada' : 'Detalhe',
    })),
    ...galeria.slice(0, 2).map((g, i) => ({
      src: g.imagem_url,
      alt: g.alt,
      label: galeria.length > 1 ? `Projeto ${i + 1}` : 'Projeto',
    })),
  ];
  const face = faceLabel(selected.face);
  const specs = [
    selected.medidas.map((m) => m.valor).join(' · '),
    selected.rendimento,
    face,
  ].filter(Boolean);

  return (
    <>
      <SectionHead config={config} total={total} />

      <div
        role="radiogroup"
        aria-label="Modelo"
        className="no-scrollbar -mx-4 mt-5 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {ordered.map((p) => {
          const checked = p.id === selected.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                'flex w-[5.5rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-[12px] border-2 bg-white p-1.5 text-center transition-colors sm:w-24',
                checked ? 'border-brand-orange' : 'hover:border-line border-transparent',
              )}
            >
              <span className="bg-sand relative block size-[4.5rem] overflow-hidden rounded-[9px] sm:size-20">
                <ProductImage src={p.imagem_principal_url} alt="" sizes="80px" />
              </span>
              <span
                className={cn(
                  'line-clamp-2 text-[0.72rem] leading-tight font-semibold',
                  checked ? 'text-brand-green' : 'text-ink/80',
                )}
              >
                {p.nome.replace(/^(Cobogó|Piso)\s+/i, '')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
        <SlideViewer slides={slides} nome={selected.nome} />
        <div className="flex flex-col" aria-live="polite">
          <h3 className="font-heading text-brand-green text-2xl font-bold">{selected.nome}</h3>
          {specs.length ? (
            <p className="text-ink/80 mt-1 text-sm tabular-nums">{specs.join(' · ')}</p>
          ) : null}
          {selected.descricao ? (
            <p className="text-muted mt-3 leading-relaxed">{selected.descricao}</p>
          ) : null}
          {selected.aplicacao ? (
            <p className="text-ink mt-3 text-sm">
              <span className="font-semibold">Onde usar:</span> {selected.aplicacao}
            </p>
          ) : null}
          <div className="mt-5 space-y-2.5 lg:mt-auto lg:pt-6">
            <AddModelButton produto={selected} />
            <Link
              href={productHref(selected)}
              className="text-brand-green flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Cores, medidas e calculadora
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Compare: side-by-side cards with a profile / applied switch                                */
/* ------------------------------------------------------------------------------------------ */

function InspirationStrip({ items, title }: { items: GaleriaItem[]; title: string }) {
  const [zoom, setZoom] = React.useState<number | null>(null);
  if (items.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="font-heading text-ink text-lg font-semibold">{title}</h3>
      <ul className="no-scrollbar -mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
        {items.map((g, i) => (
          <li key={g.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <button
              type="button"
              onClick={() => setZoom(i)}
              aria-label={`Ampliar foto: ${g.legenda ?? g.alt}`}
              className="bg-sand relative block aspect-[4/3] w-full overflow-hidden rounded-[12px]"
            >
              <Image
                src={g.imagem_url}
                alt={g.alt}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 78vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
              {g.legenda ? (
                <span className="from-brand-green-dark/85 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-3 pt-8 pb-2.5 text-left text-sm font-semibold text-white">
                  {g.legenda}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {zoom !== null ? (
        <Lightbox
          images={items.map((g) => ({ src: g.imagem_url, alt: g.alt, caption: g.legenda }))}
          index={zoom}
          onIndexChange={setZoom}
          onClose={() => setZoom(null)}
        />
      ) : null}
    </div>
  );
}

function CompareCard({
  produto,
  copy,
}: {
  produto: Produto;
  copy?: { tag: string; text: string };
}) {
  const [applied, setApplied] = React.useState(false);
  const hasApplied = Boolean(produto.imagem_aplicacao_url);
  const medidas = produto.medidas;
  const resumo =
    medidas.length > 2
      ? `${medidas[0]!.valor} a ${medidas.at(-1)!.valor} cm`
      : medidas.map((m) => (m.rotulo ? `${m.rotulo} ${m.valor}` : m.valor)).join(' · ');

  return (
    <article className="border-line flex h-full flex-col overflow-hidden rounded-[12px] border bg-white">
      <div className="bg-sand relative aspect-[4/3]">
        <ProductImage
          src={applied ? produto.imagem_aplicacao_url : produto.imagem_principal_url}
          alt={productImageAlt(produto, applied ? 'aplicacao' : 'peca')}
          sizes="(min-width: 1024px) 30vw, 80vw"
          className="transition-opacity duration-300"
        />
        {copy ? (
          <span className="bg-brand-orange font-heading text-brand-green-dark absolute top-3 left-3 rounded-md px-2 py-1 text-[0.7rem] font-semibold tracking-wide uppercase">
            {copy.tag}
          </span>
        ) : null}
      </div>
      {hasApplied ? (
        <div
          role="group"
          aria-label={`Foto de ${produto.nome}`}
          className="border-line grid grid-cols-2 border-b"
        >
          {(
            [
              [false, 'Perfil da peça'],
              [true, 'Aplicada'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={applied === value}
              onClick={() => setApplied(value)}
              className={cn(
                'font-heading min-h-11 text-sm font-semibold transition-colors',
                applied === value
                  ? 'bg-brand-green text-white'
                  : 'text-brand-green hover:bg-brand-green/8',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-heading text-brand-green text-xl font-bold">{produto.nome}</h3>
        {resumo ? <p className="text-ink/80 mt-0.5 text-sm tabular-nums">{resumo}</p> : null}
        <p className="text-muted mt-3 flex-1 leading-relaxed">{copy?.text ?? produto.descricao}</p>
        <div className="mt-5 space-y-2">
          <AddModelButton produto={produto} />
          <Link
            href={productHref(produto)}
            className="text-brand-green flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
          >
            Medidas e cores
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompareShowcase({
  config,
  produtos,
  galeria,
  total,
}: {
  config: ShowcaseConfig;
  produtos: Produto[];
  galeria: GaleriaItem[];
  total: number;
}) {
  const itens = produtos.filter((p) => !config.match || p.slug.startsWith(config.match));
  if (itens.length < 2) return null;
  return (
    <>
      <SectionHead config={config} total={total} />
      <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {itens.map((p) => (
          <li key={p.id} className="w-[84%] shrink-0 snap-start md:w-auto">
            <CompareCard produto={p} copy={config.copy?.[p.slug]} />
          </li>
        ))}
      </ul>
      <InspirationStrip items={galeria.slice(0, 3)} title="Em piscinas reais" />
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */
/* Planner: choose benches, see them to scale against the available length                    */
/* ------------------------------------------------------------------------------------------ */

function Stepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="border-line flex h-11 items-center rounded-[10px] border bg-white">
      <button
        type="button"
        aria-label={`Menos ${label}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="text-brand-green grid size-11 place-items-center disabled:opacity-40"
        disabled={value === 0}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <output
        aria-label={`Quantidade de ${label}`}
        className="w-7 text-center font-semibold tabular-nums"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={`Mais ${label}`}
        onClick={() => onChange(Math.min(20, value + 1))}
        className="text-brand-green grid size-11 place-items-center"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function PlannerShowcase({
  config,
  produtos,
  galeria,
  total,
}: {
  config: ShowcaseConfig;
  produtos: Produto[];
  galeria: GaleriaItem[];
  total: number;
}) {
  const quote = useQuote();
  const bancos = React.useMemo(
    () =>
      produtos
        .filter((p) => !config.match || p.slug.startsWith(config.match))
        .map((p) => ({ produto: p, medida: parseFootprint(p.medidas[0]?.valor) }))
        .filter(
          (b): b is { produto: Produto; medida: { comprimento: number; profundidade: number } } =>
            Boolean(b.medida),
        ),
    [produtos, config.match],
  );
  const [qtd, setQtd] = React.useState<Record<string, number>>(() =>
    bancos[0] ? { [bancos[0].produto.id]: 2 } : {},
  );
  const [espacoM, setEspacoM] = React.useState('5');
  const [gap, setGap] = React.useState(60);
  const [sent, setSent] = React.useState(false);

  if (bancos.length === 0) return null;

  const itens = bancos.map((b) => ({ ...b, qtd: qtd[b.produto.id] ?? 0 }));
  const escolhidos = itens.filter((i) => i.qtd > 0);
  const totalCm = rowLength(
    escolhidos.map((i) => ({ comprimento: i.medida.comprimento, qtd: i.qtd })),
    gap,
  );
  const espaco = Number(espacoM.replace(',', '.'));
  const espacoCm = Number.isFinite(espaco) && espaco > 0 ? Math.min(espaco, 100) * 100 : 0;
  const cabe = espacoCm > 0 && totalCm <= espacoCm;
  const sobra = espacoCm - totalCm;
  const fmt = (cm: number) =>
    `${(cm / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m`;

  // scale drawing: the longer of space / row fills the width
  const W = 360;
  const span = Math.max(espacoCm, totalCm, 100);
  const k = (W - 20) / span;
  let x = 10;
  const blocks = escolhidos.flatMap((i) =>
    Array.from({ length: i.qtd }, (_, n) => ({
      key: `${i.produto.id}-${n}`,
      nome: i.produto.nome,
      ...i.medida,
    })),
  );
  const maxDepth = Math.max(...bancos.map((b) => b.medida.profundidade));

  function sendToQuote() {
    for (const i of escolhidos) {
      quote.add({ ...quoteRef(i.produto), quantidade: i.qtd, unidade: 'peças' });
    }
    setSent(true);
  }

  return (
    <>
      <SectionHead config={config} total={total} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
        <div>
          <ul className="space-y-3">
            {itens.map((i) => (
              <li
                key={i.produto.id}
                className={cn(
                  'flex items-center gap-3 rounded-[12px] border bg-white p-2.5 transition-colors',
                  i.qtd > 0 ? 'border-brand-green' : 'border-line',
                )}
              >
                <span className="bg-sand relative size-16 shrink-0 overflow-hidden rounded-[9px]">
                  <ProductImage src={i.produto.imagem_principal_url} alt="" sizes="64px" />
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={productHref(i.produto)}
                    className="font-heading text-brand-green block leading-tight font-semibold hover:underline"
                  >
                    {i.produto.nome}
                  </Link>
                  <span className="text-muted text-sm tabular-nums">
                    {i.medida.comprimento} × {i.medida.profundidade} cm
                  </span>
                </span>
                <Stepper
                  value={i.qtd}
                  label={i.produto.nome}
                  onChange={(v) => {
                    setQtd((q) => ({ ...q, [i.produto.id]: v }));
                    setSent(false);
                  }}
                />
              </li>
            ))}
          </ul>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="planner-espaco"
                className="text-ink mb-1.5 block text-sm font-semibold"
              >
                Comprimento disponível (m)
              </label>
              <input
                id="planner-espaco"
                inputMode="decimal"
                value={espacoM}
                onChange={(e) => setEspacoM(e.target.value)}
                className="border-line text-ink focus-visible:border-brand-green h-11 w-full rounded-[10px] border bg-white px-3 text-base tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="planner-gap" className="text-ink mb-1.5 block text-sm font-semibold">
                Espaço entre bancos: {gap} cm
              </label>
              <input
                id="planner-gap"
                type="range"
                min={0}
                max={150}
                step={10}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="accent-brand-green h-11 w-full"
              />
            </div>
          </div>
        </div>

        <div className="border-line rounded-[12px] border bg-white p-4 sm:p-5">
          <p className="text-ink text-sm font-semibold">Vista de cima, em escala</p>
          <svg
            viewBox={`0 0 ${W} ${maxDepth * k + 70}`}
            className="mt-3 w-full"
            role="img"
            aria-label={
              blocks.length
                ? `${blocks.length} ${pluralize(blocks.length, 'banco', 'bancos')} ocupando ${fmt(totalCm)} de ${fmt(espacoCm)} disponíveis`
                : 'Nenhum banco escolhido'
            }
          >
            {espacoCm > 0 ? (
              <g>
                <rect
                  x={10}
                  y={18}
                  width={espacoCm * k}
                  height={maxDepth * k + 16}
                  rx={6}
                  fill="#e5f4e4"
                />
                <text x={10} y={12} fontSize={11} fill="#2D4E2F" fontWeight={600}>
                  Espaço disponível · {fmt(espacoCm)}
                </text>
              </g>
            ) : null}
            {blocks.map((b, n) => {
              const bx = x;
              x += b.comprimento * k + gap * k;
              return (
                <g key={b.key}>
                  <rect
                    x={bx}
                    y={26 + (maxDepth - b.profundidade) * k}
                    width={b.comprimento * k}
                    height={b.profundidade * k}
                    rx={3}
                    fill={bx + b.comprimento * k > 10 + espacoCm * k ? '#d9710f' : '#2D4E2F'}
                  />
                  <title>{`${b.nome} (${b.comprimento} cm) — banco ${n + 1}`}</title>
                </g>
              );
            })}
            {totalCm > 0 ? (
              <text x={10} y={maxDepth * k + 58} fontSize={11} fill="#1C2420">
                Bancos {gap > 0 ? 'e espaçamento ' : ''}· {fmt(totalCm)}
              </text>
            ) : null}
          </svg>

          <p
            className={cn(
              'mt-3 rounded-[10px] px-3 py-2.5 text-sm font-semibold',
              !blocks.length
                ? 'bg-sand text-muted'
                : cabe
                  ? 'bg-brand-green/10 text-brand-green'
                  : 'bg-brand-orange/15 text-brand-orange-ink',
            )}
            aria-live="polite"
          >
            {!blocks.length
              ? 'Escolha pelo menos um banco.'
              : espacoCm === 0
                ? `Os bancos ocupam ${fmt(totalCm)}. Informe o espaço disponível.`
                : cabe
                  ? `Cabe! Sobram ${fmt(sobra)} no espaço de ${fmt(espacoCm)}.`
                  : `Não cabe: faltam ${fmt(-sobra)}. Tire um banco ou reduza o espaçamento.`}
          </p>
          <p className="text-muted mt-2 text-xs">
            Estimativa só com as medidas dos bancos; confirme no local antes de fechar o pedido.
          </p>

          <Button
            type="button"
            size="lg"
            disabled={!blocks.length}
            onClick={sendToQuote}
            className="mt-4 h-auto w-full py-3 whitespace-normal"
          >
            {sent ? <Check /> : <ListPlus />}
            {sent
              ? 'Bancos adicionados à lista'
              : `Adicionar ${blocks.length || ''} ${pluralize(blocks.length, 'banco', 'bancos')} ao orçamento`}
          </Button>
          {sent ? (
            <Link
              href="/orcamento"
              className="text-brand-green mt-2 flex min-h-11 items-center justify-center gap-1.5 text-sm font-semibold underline"
            >
              Ver lista e enviar pelo WhatsApp
            </Link>
          ) : null}
        </div>
      </div>
      <InspirationStrip items={galeria.slice(0, 3)} title="Ideias para o ambiente" />
    </>
  );
}

/* ------------------------------------------------------------------------------------------ */

export function LineShowcase({
  config,
  produtos,
  galeria,
}: {
  config: ShowcaseConfig;
  produtos: Produto[];
  galeria: GaleriaItem[];
}) {
  const total = produtos.length;
  const props = { config, produtos, galeria, total };
  return (
    <section aria-label={config.title} className="border-line border-b bg-white">
      <div className="container-site py-8 sm:py-12">
        {config.kind === 'models' ? <ModelsShowcase {...props} /> : null}
        {config.kind === 'compare' ? <CompareShowcase {...props} /> : null}
        {config.kind === 'planner' ? <PlannerShowcase {...props} /> : null}
      </div>
    </section>
  );
}
