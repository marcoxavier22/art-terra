'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { productMessage, whatsappUrl } from '@/lib/whatsapp';
import type { Cor, Medida } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { swatchStyle } from './color-swatches';
import { PieceCalculator } from './piece-calculator';

function measureLabel(m: Medida) {
  return m.rotulo ? `${m.rotulo}: ${m.valor}` : m.valor;
}

/**
 * Colours + measures (optionally selectable) and the WhatsApp call to action.
 * Whatever the visitor picks is carried into the pre-filled message.
 */
export function QuoteBuilder({
  nome,
  whatsapp,
  cores,
  medidas,
  piecesPerM2,
}: {
  nome: string;
  whatsapp: string;
  cores: Cor[];
  medidas: Medida[];
  piecesPerM2: number | null;
}) {
  const [cor, setCor] = React.useState<string | null>(null);
  const [medida, setMedida] = React.useState<string | null>(null);
  const [calc, setCalc] = React.useState<string | null>(null);

  const base = productMessage(nome, { cor, medida });
  const message = calc ? `${base}\nÁrea estimada: ${calc}.` : base;

  return (
    <div className="space-y-7">
      <section aria-labelledby="cores-titulo">
        <h2 id="cores-titulo" className="font-heading text-brand-green text-lg font-semibold">
          Cores e acabamentos
        </h2>
        {cores.length > 0 ? (
          <>
            <p className="text-muted mt-1 text-sm">
              Toque em uma cor para incluí-la no pedido de orçamento.
            </p>
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
                      checked
                        ? 'border-brand-green bg-brand-green text-white'
                        : 'border-line text-ink hover:border-brand-green/50 bg-white',
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
                    checked
                      ? 'border-brand-green bg-brand-green text-white'
                      : 'border-line text-ink hover:border-brand-green/50 bg-white',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {piecesPerM2 ? <PieceCalculator piecesPerM2={piecesPerM2} onResult={setCalc} /> : null}

      <div>
        <Button
          asChild
          variant="whatsapp"
          size="lg"
          className="h-auto w-full py-3.5 text-center text-base whitespace-normal sm:text-[1.05rem]"
        >
          <a href={whatsappUrl(whatsapp, message)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Solicitar orçamento deste produto
          </a>
        </Button>
        <p className="text-muted mt-2.5 text-center text-sm" aria-live="polite">
          {cor || medida
            ? `Seu pedido vai com: ${[medida, cor].filter(Boolean).join(' · ')}`
            : 'Respondemos com preço, prazo e frete.'}
        </p>
      </div>
    </div>
  );
}
