/** Quote list ("lista de orçamento"): pure helpers, shared by the UI and the unit tests. */

export const UNIDADES = ['m²', 'peças', 'metros'] as const;
export type Unidade = (typeof UNIDADES)[number];

export interface QuoteItem {
  /** produto + chosen options: the same product in two colours is two lines */
  key: string;
  produtoId: string;
  nome: string;
  href: string;
  imagem: string | null;
  cor: string | null;
  medida: string | null;
  quantidade: number | null;
  unidade: Unidade;
}

export interface QuoteContact {
  nome: string;
  cidade: string;
  observacoes: string;
}

export function quoteKey(produtoId: string, cor: string | null, medida: string | null): string {
  return [produtoId, cor ?? '', medida ?? ''].join('|');
}

function formatQty(item: QuoteItem): string | null {
  if (!item.quantidade || item.quantidade <= 0) return null;
  const n = Number.isInteger(item.quantidade)
    ? String(item.quantidade)
    : item.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${n} ${item.unidade}`;
}

/** The single WhatsApp message that carries the whole list. */
export function quoteMessage(items: QuoteItem[], contact?: Partial<QuoteContact>): string {
  const lines = items.map((item, i) => {
    const details = [item.medida, item.cor].filter(Boolean).join(' · ');
    const qty = formatQty(item);
    return `${i + 1}. ${item.nome}${details ? ` (${details})` : ''}${qty ? ` — ${qty}` : ''}`;
  });
  const extra = [
    contact?.nome?.trim() ? `Nome: ${contact.nome.trim()}` : null,
    contact?.cidade?.trim() ? `Cidade da obra: ${contact.cidade.trim()}` : null,
    contact?.observacoes?.trim() ? `Observações: ${contact.observacoes.trim()}` : null,
  ].filter(Boolean);
  return [
    'Olá! Vim pelo site da Art Terra e gostaria de um orçamento para:',
    '',
    ...lines,
    ...(extra.length ? ['', ...extra] : []),
  ].join('\n');
}

/** Only our own photos or Supabase Storage URLs (anything else would break next/image). */
function safeImage(v: unknown): string | null {
  if (typeof v !== 'string' || v.length > 500) return null;
  if (v.startsWith('/') && !v.startsWith('//')) return v;
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//.test(v) ? v : null;
}

/** Defensive parse of what was saved in localStorage (it may be old or tampered with). */
export function parseStoredItems(raw: unknown): QuoteItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((v): QuoteItem[] => {
    if (!v || typeof v !== 'object') return [];
    const o = v as Record<string, unknown>;
    if (
      typeof o.produtoId !== 'string' ||
      typeof o.nome !== 'string' ||
      typeof o.href !== 'string'
    ) {
      return [];
    }
    if (!o.href.startsWith('/catalogo/')) return [];
    const cor = typeof o.cor === 'string' ? o.cor : null;
    const medida = typeof o.medida === 'string' ? o.medida : null;
    const unidade = (UNIDADES as readonly string[]).includes(o.unidade as string)
      ? (o.unidade as Unidade)
      : 'peças';
    const quantidade =
      typeof o.quantidade === 'number' && Number.isFinite(o.quantidade) && o.quantidade > 0
        ? o.quantidade
        : null;
    return [
      {
        key: quoteKey(o.produtoId, cor, medida),
        produtoId: o.produtoId,
        nome: o.nome.slice(0, 160),
        href: o.href,
        imagem: safeImage(o.imagem),
        cor,
        medida,
        quantidade,
        unidade,
      },
    ];
  });
}

/** Unit the visitor most likely thinks in for this product. */
export function defaultUnidade(produto: {
  rendimento_pecas_m2: number | null;
  rendimento: string | null;
}): Unidade {
  if (produto.rendimento_pecas_m2) return 'm²';
  if (produto.rendimento && /linear/i.test(produto.rendimento)) return 'metros';
  return 'peças';
}
