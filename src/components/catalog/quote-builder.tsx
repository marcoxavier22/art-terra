'use client';
import * as React from 'react';
import Link from 'next/link';
import { Check, ListPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { productMessage, whatsappUrl } from '@/lib/whatsapp';
import type { Unidade } from '@/lib/quote';
import type { Cor, Medida } from '@/lib/types';
import { useQuote } from '@/components/quote/quote-context';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { swatchStyle } from './color-swatches';
import { PieceCalculator } from './piece-calculator';

function measureLabel(m: Medida) {
  return m.rotulo ? `${m.rotulo}: ${m.valor}` : m.valor;
}

export interface QuoteBuilderProduct {
  id: string;
  nome: string;
  href: string;
  imagem: string | null;
  defaultUnidade: Unidade;
}

/**
 * Colours + measures (optionally selectable), the piece calculator and two calls to action:
 * add to the multi-product quote list, or ask for this product alone on WhatsApp.
 * On phones a slim bar keeps the CTA reachable once the buttons scroll out of view.
 */
export function QuoteBuilder({
  produto,
  whatsapp,
  cores,
  medidas,
  piecesPerM2,
}: {
  produto: QuoteBuilderProduct;
  whatsapp: string;
  cores: Cor[];
  medidas: Medida[];
  piecesPerM2: number | null;
}) {
  const quote = useQuote();
  const [cor, setCor] = React.useState<string | null>(null);
  const [medida, setMedida] = React.useState<string | null>(
    medidas.length === 1 ? measureLabel(medidas[0]!) : null,
  );
  const [calc, setCalc] = React.useState<string | null>(null);
  const [area, setArea] = React.useState<number | null>(null);
  const [added, setAdded] = React.useState(false);
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = React.useState(true);

  const onResult = React.useCallback((summary: string | null, areaM2: number | null) => {
    setCalc(summary);
    setArea(areaM2);
  }, []);

  React.useEffect(() => {
    const el = ctaRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry!.isIntersecting || entry!.boundingClientRect.top < 0),
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => setAdded(false), [cor, medida]);

  const base = productMessage(produto.nome, { cor, medida });
  const message = calc ? `${base}\nÁrea estimada: ${calc}.` : base;
  const inList = quote.ready && quote.has(produto.id);

  function addToList() {
    quote.add({
      produtoId: produto.id,
      nome: produto.nome,
      href: produto.href,
      imagem: produto.imagem,
      cor,
      medida,
      quantidade: area,
      unidade: area ? 'm²' : produto.defaultUnidade,
    });
    setAdded(true);
  }

  const optionClass = (checked: boolean) =>
    checked
      ? 'border-brand-green bg-brand-green text-white'
      : 'border-line text-ink hover:border-brand-green/50 bg-white';

  return (
    <div id="orcamento-produto" className="scroll-mt-24 space-y-7">
      <section aria-labelledby="cores-titulo">
        <h2 id="cores-titulo" className="font-heading text-brand-green text-lg font-semibold">
          Cores e acabamentos
        </h2>
        {cores.length > 0 ? (
          <>
            <p className="text-muted mt-1 text-sm">Toque em uma cor para incluí-la no orçamento.</p>
            <div role="radiogroup" aria-label="Cor desejada" className="mt-3 flex flex-wrap gap-2">
              {cores.map((c) => {
                const checked = cor === c.nome;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setCor(checked ? null : c.nome)}
                    className={cn(
                      'flex min-h-11 items-center gap-2.5 rounded-full border py-1 pr-4 pl-1.5 text-sm font-medium transition-colors',
                      optionClass(checked),
                    )}
                  >
                    <span
                      aria-hidden
                      style={swatchStyle(c.hex)}
                      className="border-ink/25 size-8 rounded-full border shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]"
                    />
                    {c.nome}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-ink/85 mt-1.5">Cor natural do concreto; outras sob consulta.</p>
        )}
      </section>

      {medidas.length > 1 ? (
        <section aria-labelledby="medidas-titulo">
          <h2 id="medidas-titulo" className="font-heading text-brand-green text-lg font-semibold">
            Medida desejada
          </h2>
          <div role="radiogroup" aria-label="Medida desejada" className="mt-3 flex flex-wrap gap-2">
            {medidas.map((m) => {
              const label = measureLabel(m);
              const checked = medida === label;
              return (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setMedida(checked ? null : label)}
                  className={cn(
                    'min-h-11 rounded-[10px] border px-3.5 py-2 text-left text-sm font-medium tabular-nums transition-colors',
                    optionClass(checked),
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {piecesPerM2 ? <PieceCalculator piecesPerM2={piecesPerM2} onResult={onResult} /> : null}

      <div ref={ctaRef} className="space-y-3">
        <Button
          type="button"
          size="lg"
          onClick={addToList}
          className="h-auto w-full py-3.5 text-base whitespace-normal"
        >
          {added ? <Check /> : <ListPlus />}
          {added ? 'Adicionado à lista de orçamento' : 'Adicionar à lista de orçamento'}
        </Button>
        <Button
          asChild
          variant="whatsapp"
          size="lg"
          className="h-auto w-full py-3.5 text-center text-base whitespace-normal"
        >
          <a href={whatsappUrl(whatsapp, message)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Pedir orçamento só deste produto
          </a>
        </Button>
        <p className="text-muted text-center text-sm" aria-live="polite">
          {added || inList ? (
            <>
              Está na sua lista.{' '}
              <Link href="/orcamento" className="text-brand-green font-semibold underline">
                Ver lista e enviar
              </Link>
            </>
          ) : cor || medida ? (
            `Seu pedido vai com: ${[medida, cor].filter(Boolean).join(' · ')}`
          ) : (
            'Monte uma lista com vários produtos ou peça só este. Respondemos com preço, prazo e frete.'
          )}
        </p>
      </div>

      {/* phones: keep the call to action within thumb reach */}
      <div
        data-sticky-cta
        aria-hidden={ctaVisible}
        className={cn(
          'border-line bg-offwhite/95 fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t px-4 py-2.5 backdrop-blur-md transition-all duration-300 md:hidden',
          ctaVisible ? 'pointer-events-none translate-y-4 opacity-0' : 'translate-y-0 opacity-100',
        )}
      >
        <div className="flex items-center gap-2">
          <p className="font-heading text-brand-green min-w-0 flex-1 truncate text-sm font-semibold">
            {produto.nome}
          </p>
          <Button
            type="button"
            size="sm"
            tabIndex={ctaVisible ? -1 : 0}
            onClick={() =>
              document
                .getElementById('orcamento-produto')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            Orçamento
          </Button>
          <Button asChild variant="whatsapp" size="icon" className="size-10">
            <a
              href={whatsappUrl(whatsapp, message)}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={ctaVisible ? -1 : 0}
              aria-label={`Pedir orçamento de ${produto.nome} no WhatsApp`}
            >
              <WhatsAppIcon />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
