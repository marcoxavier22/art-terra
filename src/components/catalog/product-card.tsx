import Link from 'next/link';
import { Star } from 'lucide-react';
import { defaultUnidade } from '@/lib/quote';
import { faceLabel } from '@/lib/text';
import { productMessage, whatsappUrl } from '@/lib/whatsapp';
import type { Produto } from '@/lib/types';
import { WhatsAppIcon } from '@/components/ui/icons';
import { AddToQuoteButton } from '@/components/quote/add-to-quote-button';
import { ColorSwatches } from './color-swatches';
import { productImageAlt } from '@/lib/image-seo';
import { CardMedia } from './card-media';

export const CARD_SIZES =
  '(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 48vw';

export function productHref(produto: Pick<Produto, 'slug' | 'categoria'>) {
  return `/catalogo/${produto.categoria.slug}/${produto.slug}`;
}

/**
 * Catalogue card. Two per row on phones: the whole card opens the product, and the
 * footer has "+ Orçamento" (quote list) and WhatsApp side by side.
 */
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
  const href = productHref(produto);
  const [firstMeasure, ...otherMeasures] = produto.medidas;
  const face = faceLabel(produto.face);
  const specs = [
    firstMeasure
      ? `${firstMeasure.valor}${otherMeasures.length ? ` +${otherMeasures.length}` : ''}`
      : null,
    produto.rendimento && produto.rendimento.length <= 16 ? produto.rendimento : null,
  ].filter(Boolean);

  return (
    <article className="group border-line focus-within:shadow-lift hover:shadow-lift relative flex h-full flex-col overflow-hidden rounded-[12px] border bg-white transition-shadow duration-300">
      <div className="bg-sand relative aspect-square overflow-hidden sm:aspect-[4/3]">
        <CardMedia
          peca={produto.imagem_principal_url}
          aplicacao={produto.imagem_aplicacao_url}
          altPeca={productImageAlt(produto, 'peca')}
          altAplicacao={productImageAlt(produto, 'aplicacao')}
          sizes={CARD_SIZES}
          priority={priority}
        />
        <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-1.5 sm:inset-x-3 sm:top-3">
          {showCategory ? (
            <span className="font-heading text-brand-green max-w-[70%] truncate rounded-md bg-white/92 px-1.5 py-0.5 text-[0.62rem] font-semibold tracking-wide uppercase shadow-sm sm:px-2 sm:py-1 sm:text-[0.7rem]">
              {produto.categoria.nome}
            </span>
          ) : (
            <span />
          )}
          {produto.destaque ? (
            <span className="bg-brand-orange font-heading text-brand-green-dark flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.62rem] font-semibold tracking-wide uppercase shadow-sm sm:px-2 sm:py-1 sm:text-[0.7rem]">
              <Star className="size-3 fill-current" aria-hidden />
              <span className="sr-only sm:not-sr-only">Destaque</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <h3 className="font-heading text-brand-green line-clamp-2 text-[0.95rem] leading-snug font-semibold sm:text-lg">
          {/* stretched link: the whole card is clickable and reachable by keyboard */}
          <Link
            href={href}
            className="focus-visible:after:outline-brand-orange rounded outline-none after:absolute after:inset-0 after:rounded-[12px] after:content-[''] focus-visible:after:outline-3 focus-visible:after:outline-offset-2"
          >
            {produto.nome}
          </Link>
        </h3>

        {specs.length || face ? (
          <p className="text-muted mt-1 text-[0.78rem] leading-snug tabular-nums sm:mt-1.5 sm:text-sm">
            {[...specs, face].filter(Boolean).join(' · ')}
          </p>
        ) : null}

        <ColorSwatches cores={produto.cores} max={5} size="sm" className="mt-2.5 sm:mt-3" />

        <div className="relative z-10 mt-auto flex gap-2 pt-3 sm:pt-4">
          <AddToQuoteButton
            compact
            className="flex-1"
            produto={{
              id: produto.id,
              nome: produto.nome,
              href,
              imagem: produto.imagem_principal_url,
              defaultUnidade: defaultUnidade(produto),
            }}
          />
          <a
            href={whatsappUrl(whatsapp, productMessage(produto.nome))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultar no WhatsApp: ${produto.nome}`}
            title="Consultar no WhatsApp"
            className="bg-whatsapp hover:bg-whatsapp-dark grid size-11 shrink-0 place-items-center rounded-[10px] text-[#06281a] transition-colors"
          >
            <WhatsAppIcon className="size-5" />
          </a>
        </div>
      </div>
    </article>
  );
}
