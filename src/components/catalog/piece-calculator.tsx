'use client';
import * as React from 'react';
import { Calculator, Info } from 'lucide-react';
import { estimatePieces } from '@/lib/calculator';
import { Input, Label } from '@/components/ui/form';

function parseDecimal(value: string): number {
  return Number(value.replace(/\./g, '').replace(',', '.').trim());
}

export function PieceCalculator({
  piecesPerM2,
  onResult,
}: {
  piecesPerM2: number;
  onResult?: (summary: string | null, areaM2: number | null) => void;
}) {
  const [area, setArea] = React.useState('');
  const [loss, setLoss] = React.useState('10');

  const areaValue = parseDecimal(area);
  const lossValue = loss.trim() === '' ? 0 : parseDecimal(loss);
  const result = area.trim() ? estimatePieces(areaValue, piecesPerM2, lossValue) : null;
  const invalid = area.trim() !== '' && !result;

  const summary = result
    ? `${area.trim()} m² ≈ ${result.total.toLocaleString('pt-BR')} peças (com ${lossValue.toLocaleString('pt-BR')}% de perda)`
    : null;
  React.useEffect(() => {
    onResult?.(summary, result ? areaValue : null);
  }, [summary, onResult, result, areaValue]);

  return (
    <section
      aria-labelledby="calc-titulo"
      className="border-line shadow-soft rounded-[12px] border bg-white p-5"
    >
      <h2
        id="calc-titulo"
        className="font-heading text-brand-green flex items-center gap-2 text-lg font-semibold"
      >
        <Calculator className="text-brand-orange-ink size-5" aria-hidden />
        Calculadora rápida
      </h2>
      <p className="text-muted mt-1 text-sm">
        Informe a área e veja quantas peças você precisa ({piecesPerM2.toLocaleString('pt-BR')}{' '}
        peças por m²).
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="calc-area">Área (m²)</Label>
          <Input
            id="calc-area"
            inputMode="decimal"
            placeholder="Ex.: 25"
            value={area}
            onChange={(e) => setArea(e.target.value.replace(/[^\d.,]/g, '').slice(0, 9))}
            aria-invalid={invalid}
            aria-describedby="calc-aviso"
          />
        </div>
        <div>
          <Label htmlFor="calc-perda">Perda (%)</Label>
          <Input
            id="calc-perda"
            inputMode="decimal"
            value={loss}
            onChange={(e) => setLoss(e.target.value.replace(/[^\d.,]/g, '').slice(0, 5))}
          />
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="bg-sand text-ink mt-4 rounded-[10px] px-4 py-3.5"
      >
        {result ? (
          <>
            <p className="font-heading text-brand-green text-2xl font-bold">
              ≈ {result.total.toLocaleString('pt-BR')} peças
            </p>
            <p className="text-muted mt-0.5 text-sm">
              {result.base.toLocaleString('pt-BR')} peças para a área
              {lossValue > 0
                ? ` + ${(result.total - result.base).toLocaleString('pt-BR')} de margem para cortes e perdas`
                : ', sem margem de perda'}
              .
            </p>
          </>
        ) : (
          <p className="text-muted text-sm">
            {invalid ? 'Digite uma área válida, maior que zero.' : 'O resultado aparece aqui.'}
          </p>
        )}
      </div>

      <p id="calc-aviso" className="text-muted mt-3 flex items-start gap-2 text-xs leading-relaxed">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Estimativa; confirme com a fábrica antes de comprar.
      </p>
    </section>
  );
}
