'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, Download, RotateCcw, Search, SearchX, X } from 'lucide-react';
import { normalizeText, pluralize, slugify } from '@/lib/text';
import { whatsappUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import type { CategoriaComContagem, Cor, Produto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { SectionLabel } from '@/components/ui/section-label';
import { swatchStyle } from './color-swatches';
import { ProductCard } from './product-card';

type SortKey = 'ordem' | 'nome';

const GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-4';

function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = React.useRef(fn);
  React.useEffect(() => {
    latest.current = fn;
  });
  React.useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  return React.useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay],
  );
}

export function CatalogBrowser({
  categorias,
  produtos,
  whatsapp,
  pdfUrl,
}: {
  categorias: CategoriaComContagem[];
  produtos: Produto[];
  whatsapp: string;
  pdfUrl: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const catParam = searchParams.get('cat') ?? '';
  const activeCat = categorias.find((c) => c.slug === catParam) ?? null;
  const query = searchParams.get('q') ?? '';
  const sort: SortKey = searchParams.get('ord') === 'nome' ? 'nome' : 'ordem';
  const colorParam = searchParams.get('cor') ?? '';
  const selectedColors = React.useMemo(
    () => new Set(colorParam.split(',').filter(Boolean)),
    [colorParam],
  );

  // The input keeps its own state so typing stays instant; the URL follows after 250 ms.
  const [search, setSearch] = React.useState(query);
  const lastPushed = React.useRef(query);
  React.useEffect(() => {
    // external navigation (back/forward, link) changed ?q= — sync the input
    if (query !== lastPushed.current) {
      lastPushed.current = query;
      setSearch(query);
    }
  }, [query]);

  const updateParams = React.useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(changes)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const pushSearch = useDebouncedCallback((value: string) => {
    lastPushed.current = value.trim();
    updateParams({ q: value.trim() || null });
  }, 250);

  const normalizedQuery = normalizeText(query);

  // category + search (colour options are derived from this set)
  const base = React.useMemo(
    () =>
      produtos.filter(
        (p) =>
          (!activeCat || p.categoria.slug === activeCat.slug) &&
          (!normalizedQuery || normalizeText(p.nome).includes(normalizedQuery)),
      ),
    [produtos, activeCat, normalizedQuery],
  );

  const colorOptions = React.useMemo(() => {
    const map = new Map<string, Cor>();
    for (const p of base) for (const c of p.cores) map.set(c.id, c);
    return [...map.values()].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome));
  }, [base]);

  const filtered = React.useMemo(() => {
    const list =
      selectedColors.size === 0
        ? base
        : base.filter((p) => p.cores.some((c) => selectedColors.has(slugify(c.nome))));
    if (sort === 'nome') return [...list].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    return list;
  }, [base, selectedColors, sort]);

  const groups = React.useMemo(() => {
    if (activeCat) return [{ categoria: activeCat, itens: filtered }];
    return categorias
      .map((c) => ({ categoria: c, itens: filtered.filter((p) => p.categoria.slug === c.slug) }))
      .filter((g) => g.itens.length > 0);
  }, [activeCat, categorias, filtered]);

  const hasFilters = Boolean(activeCat || query || selectedColors.size || sort !== 'ordem');

  function toggleColor(cor: Cor) {
    const key = slugify(cor.nome);
    const next = new Set(selectedColors);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateParams({ cor: [...next].join(',') || null });
  }

  function clearAll() {
    setSearch('');
    lastPushed.current = '';
    router.replace(pathname, { scroll: false });
  }

  const tabs = [
    { slug: '', nome: 'Todos', total: produtos.length },
    ...categorias.map((c) => ({ slug: c.slug, nome: c.nome, total: c.total })),
  ];

  return (
    <div>
      {/* ------------------------------ sticky controls ------------------------------ */}
      <div className="border-line bg-offwhite/92 sticky top-[68px] z-20 border-y backdrop-blur-md">
        <div className="container-site py-3">
          <nav aria-label="Linhas do catálogo">
            <ul className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {tabs.map((tab) => {
                const active = (activeCat?.slug ?? '') === tab.slug;
                return (
                  <li key={tab.slug || 'todos'} className="shrink-0 snap-start">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => updateParams({ cat: tab.slug || null, cor: null })}
                      className={cn(
                        'font-heading flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors',
                        active
                          ? 'border-brand-green bg-brand-green text-white'
                          : 'border-line text-ink hover:border-brand-green/50 bg-white',
                      )}
                    >
                      {tab.nome}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-xs leading-none font-semibold tabular-nums',
                          active ? 'bg-brand-orange text-brand-green-dark' : 'bg-sand text-muted',
                        )}
                      >
                        <span aria-hidden>· </span>
                        {tab.total}
                        <span className="sr-only">
                          {' '}
                          {pluralize(tab.total, 'produto', 'produtos')}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-2.5 flex gap-2.5">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="busca-catalogo" className="sr-only">
                Buscar produto pelo nome
              </label>
              <Search
                className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-[1.1rem] -translate-y-1/2"
                aria-hidden
              />
              <input
                id="busca-catalogo"
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Buscar por nome"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  pushSearch(e.target.value);
                }}
                className={cn(
                  'border-line text-ink placeholder:text-muted/70 hover:border-brand-green/40 focus-visible:border-brand-green h-11 w-full rounded-[10px] border bg-white pl-10 text-base [&::-webkit-search-cancel-button]:hidden',
                  search ? 'pr-10' : 'pr-3',
                )}
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setSearch('');
                    lastPushed.current = '';
                    updateParams({ q: null });
                  }}
                  className="text-muted hover:text-ink absolute top-1/2 right-0 grid size-11 -translate-y-1/2 place-items-center rounded-full"
                >
                  <X className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>
            <div className="shrink-0">
              <label htmlFor="ordem-catalogo" className="sr-only">
                Ordenar produtos
              </label>
              <select
                id="ordem-catalogo"
                value={sort}
                onChange={(e) => updateParams({ ord: e.target.value === 'nome' ? 'nome' : null })}
                className="border-line text-ink hover:border-brand-green/40 h-11 max-w-[9.5rem] rounded-[10px] border bg-white px-3 text-sm font-medium sm:max-w-none"
              >
                <option value="ordem">Ordem do catálogo</option>
                <option value="nome">Nome A–Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------- content ---------------------------------- */}
      <div className="container-site pt-6 pb-20">
        {activeCat?.descricao ? (
          <div className="border-brand-orange mb-6 max-w-3xl border-l-4 pl-4">
            <h2 className="font-heading text-brand-green text-xl font-bold">{activeCat.nome}</h2>
            <p className="text-muted mt-1.5 leading-relaxed">{activeCat.descricao}</p>
          </div>
        ) : null}

        {colorOptions.length > 0 ? (
          <fieldset className="mb-5 min-w-0">
            <legend className="text-ink mb-2 text-sm font-semibold">Filtrar por cor</legend>
            <div className="no-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {colorOptions.map((cor) => {
                const checked = selectedColors.has(slugify(cor.nome));
                return (
                  <button
                    key={cor.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleColor(cor)}
                    className={cn(
                      'flex min-h-11 shrink-0 items-center gap-2 rounded-full border py-1 pr-3.5 pl-1.5 text-sm font-medium transition-colors',
                      checked
                        ? 'border-brand-green bg-brand-green/8 text-brand-green'
                        : 'border-line text-ink hover:border-brand-green/50 bg-white',
                    )}
                  >
                    <span
                      aria-hidden
                      style={swatchStyle(cor.hex)}
                      className="border-ink/25 grid size-7 place-items-center rounded-full border"
                    >
                      {checked ? (
                        <Check className="size-4 text-white mix-blend-difference" strokeWidth={3} />
                      ) : null}
                    </span>
                    {cor.nome}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-muted text-sm" role="status" aria-live="polite">
            Exibindo <strong className="text-ink font-semibold">{filtered.length}</strong>{' '}
            {pluralize(filtered.length, 'produto', 'produtos')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <RotateCcw />
                Limpar filtros
              </Button>
            ) : null}
            {pdfUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
                  <Download />
                  Baixar catálogo em PDF
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border-line mx-auto max-w-lg rounded-[12px] border border-dashed bg-white px-6 py-12 text-center">
            <SearchX className="text-brand-orange-ink mx-auto size-10" aria-hidden />
            <h2 className="font-heading text-brand-green mt-4 text-xl font-bold">
              {query
                ? `Nenhum produto encontrado para “${query}”.`
                : 'Nenhum produto encontrado com esses filtros.'}
            </h2>
            <p className="text-muted mt-2">
              Tente outro nome ou remova os filtros. Se preferir, a gente ajuda a encontrar a peça
              certa.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" onClick={clearAll}>
                <RotateCcw />
                {query ? 'Limpar busca' : 'Limpar filtros'}
              </Button>
              <Button asChild variant="whatsapp">
                <a
                  href={whatsappUrl(
                    whatsapp,
                    query
                      ? `Olá! Procurei por “${query}” no catálogo do site e não encontrei. Vocês fabricam?`
                      : 'Olá! Não encontrei o que procurava no catálogo do site. Podem me ajudar?',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon />
                  Não achou? Fale com a gente
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-14">
            {groups.map((group, groupIndex) => (
              <section
                key={group.categoria.id}
                id={group.categoria.slug}
                aria-labelledby={`titulo-${group.categoria.slug}`}
                className="scroll-mt-52"
              >
                {!activeCat ? (
                  <div className="border-line mb-5 flex flex-wrap items-end justify-between gap-3 border-b pb-3">
                    <div>
                      <SectionLabel>
                        {String(groupIndex + 1).padStart(2, '0')} · {group.itens.length}{' '}
                        {pluralize(group.itens.length, 'modelo', 'modelos')}
                      </SectionLabel>
                      <h2
                        id={`titulo-${group.categoria.slug}`}
                        className="font-heading text-brand-green mt-1.5 text-2xl font-bold sm:text-[1.7rem]"
                      >
                        {group.categoria.nome}
                      </h2>
                    </div>
                    <Link
                      href={`/catalogo?cat=${group.categoria.slug}`}
                      scroll={false}
                      className="text-brand-green inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      Ver só esta linha
                    </Link>
                  </div>
                ) : (
                  <h2 id={`titulo-${group.categoria.slug}`} className="sr-only">
                    Produtos da linha {group.categoria.nome}
                  </h2>
                )}
                <ul className={GRID}>
                  {group.itens.map((produto, i) => (
                    <li key={produto.id}>
                      <ProductCard
                        produto={produto}
                        whatsapp={whatsapp}
                        showCategory={false}
                        priority={groupIndex === 0 && i < 2}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando catálogo">
      <div className="border-line bg-offwhite border-y">
        <div className="container-site flex gap-2 overflow-hidden py-3">
          {[5, 9, 7, 5, 11].map((w, i) => (
            <div
              key={i}
              className="bg-line/70 h-11 shrink-0 animate-pulse rounded-full"
              style={{ width: `${w}rem` }}
            />
          ))}
        </div>
        <div className="container-site pb-3">
          <div className="bg-line/70 h-11 animate-pulse rounded-[10px]" />
        </div>
      </div>
      <div className="container-site pt-8 pb-20">
        <ul className={GRID}>
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="border-line overflow-hidden rounded-[12px] border bg-white">
              <div className="bg-line/70 aspect-[4/3] animate-pulse" />
              <div className="space-y-3 p-5">
                <div className="bg-line/70 h-5 w-2/3 animate-pulse rounded" />
                <div className="bg-line/60 h-4 w-1/2 animate-pulse rounded" />
                <div className="bg-line/60 h-4 w-1/3 animate-pulse rounded" />
                <div className="bg-line/60 h-11 animate-pulse rounded-[10px]" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
