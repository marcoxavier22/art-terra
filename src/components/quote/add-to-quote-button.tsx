'use client';
import * as React from 'react';
import Link from 'next/link';
import { Check, ClipboardList, Plus } from 'lucide-react';
import type { Unidade } from '@/lib/quote';
import { cn } from '@/lib/utils';
import { useQuote } from './quote-context';

export interface QuoteProductRef {
  id: string;
  nome: string;
  href: string;
  imagem: string | null;
  defaultUnidade: Unidade;
}

/** "+ Orçamento" on product cards. Once added it turns into a link to the list. */
export function AddToQuoteButton({
  produto,
  compact = false,
  className,
}: {
  produto: QuoteProductRef;
  compact?: boolean;
  className?: string;
}) {
  const { has, add, ready } = useQuote();
  const inList = ready && has(produto.id);
  const base = cn(
    'font-heading relative inline-flex min-h-11 items-center justify-center gap-1 rounded-[10px] px-2 text-sm font-semibold whitespace-nowrap transition-colors sm:gap-1.5 sm:px-3',
    className,
  );

  if (inList) {
    return (
      <Link
        href="/orcamento"
        className={cn(base, 'bg-brand-green/10 text-brand-green hover:bg-brand-green/15')}
      >
        <Check className="size-4 shrink-0" aria-hidden />
        {compact ? (
          <>
            <span className="sm:hidden">Lista</span>
            <span className="hidden sm:inline">Na lista</span>
          </>
        ) : (
          'Na lista'
        )}
        <span className="sr-only">: {produto.nome} está na lista de orçamento, ver lista</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() =>
        add({
          produtoId: produto.id,
          nome: produto.nome,
          href: produto.href,
          imagem: produto.imagem,
          cor: null,
          medida: null,
          quantidade: null,
          unidade: produto.defaultUnidade,
        })
      }
      className={cn(
        base,
        'bg-brand-orange text-brand-green-dark hover:bg-brand-orange-dark hover:text-white',
      )}
    >
      <Plus className="size-4 shrink-0" aria-hidden />
      {compact ? (
        <>
          <span className="sm:hidden">Orçar</span>
          <span className="hidden sm:inline">Orçamento</span>
        </>
      ) : (
        'Orçamento'
      )}
      <span className="sr-only">: adicionar {produto.nome} à lista de orçamento</span>
    </button>
  );
}

/** Small counter used by the header and the phone bottom bar. */
export function QuoteCount({ className }: { className?: string }) {
  const { items, ready } = useQuote();
  if (!ready || items.length === 0) return null;
  return (
    <span
      className={cn(
        'bg-brand-orange text-brand-green-dark grid min-w-5 place-items-center rounded-full px-1 text-[0.7rem] leading-5 font-bold tabular-nums',
        className,
      )}
    >
      {items.length}
      <span className="sr-only"> {items.length === 1 ? 'item' : 'itens'}</span>
    </span>
  );
}

export function QuoteHeaderLink() {
  return (
    <Link
      href="/orcamento"
      className="text-brand-green hover:bg-brand-green/10 font-heading relative hidden h-11 items-center gap-2 rounded-[10px] px-3 text-[0.95rem] font-semibold md:inline-flex"
    >
      <ClipboardList className="size-5" aria-hidden />
      <span className="hidden xl:inline">Orçamento</span>
      <span className="sr-only xl:hidden">Lista de orçamento</span>
      <QuoteCount className="absolute -top-0.5 right-0 xl:static" />
    </Link>
  );
}
