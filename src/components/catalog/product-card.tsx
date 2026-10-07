import Link from 'next/link';
import { Layers, Ruler, SquareStack, Star } from 'lucide-react';
import { faceLabel } from '@/lib/text';
import { productMessage, whatsappUrl } from '@/lib/whatsapp';
import type { Produto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { ColorSwatches } from './color-swatches';
import { ProductImage } from './product-image';

export const CARD_SIZES =
  '(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 94vw';

export function ProductCard({
  produto,
  whatsapp,
  priority = false,
  showCategory = true,
}: {
  produto: Produto;
  whatsapp: string;
  priority?: boolean;
  showCategory?: boolean;
}) {
  const href = `/catalogo/${produto.categoria.slug}/${produto.slug}`;
  const [firstMeasure, ...otherMeasures] = produto.medidas;
  const face = faceLabel(produto.face);

  return (
    <article className="group border-line shadow-soft focus-within:shadow-lift hover:shadow-lift relative flex h-full flex-col overflow-hidden rounded-[12px] border bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5">
      <div className="bg-sand relative aspect-[4/3] overflow-hidden">
        <ProductImage
          src={produto.imagem_principal_url}
          alt={produto.nome}
          sizes={CARD_SIZES}
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {produto.imagem_aplicacao_url ? (
          <div
            aria-hidden
            className="absolute inset-0 hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 [@media(hover:hover)]:block"
          >
            <ProductImage src={produto.imagem_aplicacao_url} alt="" sizes={CARD_SIZES} />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {showCategory ? (
            <span className="font-heading text-brand-green rounded-md bg-white/92 px-2 py-1 text-[0.7rem] font-semibold tracking-wide uppercase shadow-sm">
              {produto.categoria.nome}
            </span>
          ) : (
            <span />
          )}
          {produto.destaque ? (
            <span className="bg-brand-orange font-heading text-brand-green-dark flex items-center gap-1 rounded-md px-2 py-1 text-[0.7rem] font-semibold tracking-wide uppercase shadow-sm">
              <Star className="size-3 fill-current" aria-hidden />
              Destaque
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-heading text-brand-green text-lg leading-snug font-semibold">
          {/* stretched link: the whole card is clickable and reachable by keyboard */}
          <Link
            href={href}
            className="focus-visible:after:outline-brand-orange rounded outline-none after:absolute after:inset-0 after:rounded-[12px] after:content-[''] focus-visible:after:outline-3 focus-visible:after:outline-offset-2"
          >
            {produto.nome}
          </Link>
        </h3>

        <dl className="text-ink/85 mt-3 space-y-1.5 text-sm">
          {firstMeasure ? (
            <div className="flex items-start gap-2">
              <dt className="text-muted flex shrink-0 items-center gap-2">
                <Ruler className="text-brand-orange-ink size-4" aria-hidden />
                <span className="sr-only">Medidas</span>
              </dt>
              <dd className="min-w-0">
                <span className="break-words">
                  {firstMeasure.rotulo ? `${firstMeasure.rotulo}: ` : ''}
                  {firstMeasure.valor}
                </span>
                {otherMeasures.length > 0 ? (
                  <span
                    className="bg-sand text-muted ml-1.5 rounded px-1.5 py-0.5 text-xs font-semibold"
                    title={otherMeasures.map((m) => m.valor).join(' · ')}
                  >
                    +{otherMeasures.length}
                    <span className="sr-only"> outras medidas</span>
                  </span>
                ) : null}
              </dd>
            </div>
          ) : null}
          {produto.rendimento ? (
            <div className="flex items-start gap-2">
              <dt className="text-muted flex shrink-0 items-center gap-2">
                <SquareStack className="text-brand-orange-ink size-4" aria-hidden />
                <span className="sr-only">Rendimento</span>
              </dt>
              <dd>{produto.rendimento}</dd>
            </div>
          ) : null}
          {face ? (
            <div className="flex items-start gap-2">
              <dt className="text-muted flex shrink-0 items-center gap-2">
                <Layers className="text-brand-orange-ink size-4" aria-hidden />
                <span className="sr-only">Face</span>
              </dt>
              <dd>{face}</dd>
            </div>
          ) : null}
        </dl>

        <ColorSwatches cores={produto.cores} size="sm" className="mt-3.5" />

        <div className="relative z-10 mt-auto grid grid-cols-1 gap-2 pt-5">
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link href={href} aria-label={`Ver detalhes: ${produto.nome}`}>
              Ver detalhes
            </Link>
          </Button>
          <Button asChild variant="whatsapp" size="sm" className="min-h-11">
            <a
              href={whatsappUrl(whatsapp, productMessage(produto.nome))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Consultar no WhatsApp: ${produto.nome}`}
            >
              <WhatsAppIcon />
              Consultar no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
