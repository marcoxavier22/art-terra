'use client';
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ClipboardList, ImageOff, Minus, Plus, Trash2 } from 'lucide-react';
import { UNIDADES, quoteMessage, type QuoteItem, type Unidade } from '@/lib/quote';
import { whatsappUrl } from '@/lib/whatsapp';
import { pluralize } from '@/lib/text';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { useQuote } from './quote-context';

const inputClass =
  'border-line text-ink placeholder:text-muted/70 hover:border-brand-green/40 focus-visible:border-brand-green h-11 w-full rounded-[10px] border bg-white px-3 text-base';

function parseQty(value: string): number | null {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 1_000_000) : null;
}

function QuoteRow({ item }: { item: QuoteItem }) {
  const { update, remove } = useQuote();
  const [text, setText] = React.useState(
    item.quantidade ? String(item.quantidade).replace('.', ',') : '',
  );
  const step = 1;
  const details = [item.medida, item.cor].filter(Boolean).join(' · ');
  const qtyId = `qtd-${item.key}`;

  function setQty(n: number | null) {
    setText(n ? String(n).replace('.', ',') : '');
    update(item.key, { quantidade: n });
  }

  return (
    <li className="border-line flex gap-3 rounded-[12px] border bg-white p-3 sm:gap-4 sm:p-4">
      <Link
        href={item.href}
        className="bg-sand relative size-20 shrink-0 overflow-hidden rounded-[10px] sm:size-24"
        tabIndex={-1}
        aria-hidden
      >
        {item.imagem ? (
          <Image src={item.imagem} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <ImageOff className="text-muted absolute inset-0 m-auto size-6" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={item.href}
              className="font-heading text-brand-green line-clamp-2 leading-snug font-semibold hover:underline"
            >
              {item.nome}
            </Link>
            {details ? <p className="text-muted mt-0.5 text-sm">{details}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => remove(item.key)}
            aria-label={`Remover ${item.nome} da lista`}
            className="text-muted hover:bg-danger/10 hover:text-danger -mt-1.5 -mr-1.5 grid size-11 shrink-0 place-items-center rounded-full"
          >
            <Trash2 className="size-[1.1rem]" aria-hidden />
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <label htmlFor={qtyId} className="sr-only">
            Quantidade de {item.nome}
          </label>
          <div className="border-line flex h-11 items-center rounded-[10px] border bg-white">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() =>
                setQty(item.quantidade && item.quantidade > step ? item.quantidade - step : null)
              }
              className="text-brand-green grid size-11 place-items-center"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <input
              id={qtyId}
              inputMode="decimal"
              placeholder="Qtd."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                update(item.key, { quantidade: parseQty(e.target.value) });
              }}
              className="text-ink w-16 bg-transparent text-center text-base tabular-nums outline-none"
            />
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => setQty(Math.round(((item.quantidade ?? 0) + step) * 100) / 100)}
              className="text-brand-green grid size-11 place-items-center"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <label htmlFor={`un-${item.key}`} className="sr-only">
            Unidade de {item.nome}
          </label>
          <select
            id={`un-${item.key}`}
            value={item.unidade}
            onChange={(e) => update(item.key, { unidade: e.target.value as Unidade })}
            className="border-line text-ink h-11 rounded-[10px] border bg-white px-2.5 text-sm font-medium"
          >
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
    </li>
  );
}

export function QuoteList({ whatsapp }: { whatsapp: string }) {
  const { items, ready, contact, setContact, clear } = useQuote();

  if (!ready) {
    return (
      <div className="container-site py-12" aria-busy="true">
        <div className="bg-line/70 h-28 animate-pulse rounded-[12px]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-site py-14 sm:py-20">
        <div className="border-line mx-auto max-w-lg rounded-[12px] border border-dashed bg-white px-6 py-12 text-center">
          <ClipboardList className="text-brand-orange-ink mx-auto size-10" aria-hidden />
          <h2 className="font-heading text-brand-green mt-4 text-xl font-bold">
            Sua lista está vazia
          </h2>
          <p className="text-muted mt-2">
            No catálogo, toque em <strong className="text-ink">+ Orçar</strong> nos produtos que
            você quer. Depois é só voltar aqui e enviar tudo de uma vez pelo WhatsApp.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/catalogo">Ver catálogo</Link>
            </Button>
            <Button asChild variant="whatsapp">
              <a href={whatsappUrl(whatsapp)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Falar direto no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const href = whatsappUrl(whatsapp, quoteMessage(items, contact));

  return (
    <div className="container-site grid gap-8 py-8 sm:py-12 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
      <section aria-labelledby="itens-titulo">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="itens-titulo" className="font-heading text-brand-green text-xl font-bold">
            {items.length} {pluralize(items.length, 'produto', 'produtos')}
          </h2>
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 />
            Esvaziar lista
          </Button>
        </div>
        <ul className="space-y-3">
          {items.map((item) => (
            <QuoteRow key={item.key} item={item} />
          ))}
        </ul>
        <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
          <Link href="/catalogo">
            <Plus />
            Adicionar mais produtos
          </Link>
        </Button>
      </section>

      <section
        aria-labelledby="envio-titulo"
        className="border-line h-fit rounded-[12px] border bg-white p-5 sm:p-6 lg:sticky lg:top-24"
      >
        <h2 id="envio-titulo" className="font-heading text-brand-green text-xl font-bold">
          Enviar pedido
        </h2>
        <p className="text-muted mt-1 text-sm">
          Opcional, mas ajuda a calcular o frete. Nada é salvo nos nossos servidores: tudo vai na
          mensagem do WhatsApp.
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="orc-nome" className="text-ink mb-1.5 block text-sm font-semibold">
              Seu nome
            </label>
            <input
              id="orc-nome"
              autoComplete="name"
              value={contact.nome}
              maxLength={80}
              onChange={(e) => setContact({ ...contact, nome: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="orc-cidade" className="text-ink mb-1.5 block text-sm font-semibold">
              Cidade da obra
            </label>
            <input
              id="orc-cidade"
              autoComplete="address-level2"
              placeholder="Ex.: Volta Redonda"
              value={contact.cidade}
              maxLength={80}
              onChange={(e) => setContact({ ...contact, cidade: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="orc-obs" className="text-ink mb-1.5 block text-sm font-semibold">
              Observações
            </label>
            <textarea
              id="orc-obs"
              rows={3}
              maxLength={500}
              placeholder="Prazo, retirada na fábrica, medidas da piscina…"
              value={contact.observacoes}
              onChange={(e) => setContact({ ...contact, observacoes: e.target.value })}
              className={`${inputClass} h-auto py-2.5`}
            />
          </div>
        </div>
        <Button
          asChild
          variant="whatsapp"
          size="lg"
          className="mt-6 h-auto w-full py-3.5 text-base whitespace-normal"
        >
          <a href={href} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Enviar lista pelo WhatsApp
          </a>
        </Button>
        <p className="text-muted mt-2.5 text-center text-xs">
          Abre o WhatsApp com a mensagem pronta. Você revisa antes de enviar.
        </p>
      </section>
    </div>
  );
}
