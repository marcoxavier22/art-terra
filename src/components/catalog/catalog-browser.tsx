'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, Download, RotateCcw, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { normalizeText, pluralize, slugify } from '@/lib/text';
import { USOS, isUsoSlug, usosDoProduto } from '@/lib/usos';
import { whatsappUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';
import type { CategoriaComContagem, Cor, Produto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SectionLabel } from '@/components/ui/section-label';
import { swatchStyle } from './color-swatches';
import { ProductCard } from './product-card';

type SortKey = 'ordem' | 'nome';

export const GRID = 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6 2xl:grid-cols-4';

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

const chip =
  'font-heading relative flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors';
const chipOn = 'border-brand-green bg-brand-green text-white';
const chipOff = 'border-line text-ink hover:border-brand-green/50 bg-white';

/**
 * Catalogue grid with category links, "where will you use it" filter, colour filter,
 * search and sort. Everything lives in the URL so filtered views can be shared.
 * On a category page (`categoria` set) the category comes from the path.
 */
export function CatalogBrowser({
  categorias,
  produtos,
  whatsapp,
  pdfUrl,
  categoria,
}: {
  categorias: CategoriaComContagem[];
  produtos: Produto[];
  whatsapp: string;
  pdfUrl: string | null;
  categoria?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCat = categorias.find((c) => c.slug === categoria) ?? null;
  const query = searchParams.get('q') ?? '';
  const sort: SortKey = searchParams.get('ord') === 'nome' ? 'nome' : 'ordem';
  const usoParam = searchParams.get('uso');
  const uso = isUsoSlug(usoParam) ? usoParam : null;
  const colorParam = searchParams.get('cor') ?? '';
  const selectedColors = React.useMemo(
    () => new Set(colorParam.split(',').filter(Boolean)),
    [colorParam],
  );

  // The input keeps its own state so typing stays instant; the URL follows after 250 ms.
  const [search, setSearch] = React.useState(query);
  const lastPushed = React.useRef(query);
  React.useEffect(() => {
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

  /** Link to another category keeping search/use/sort (colours depend on the line). */
  const categoryHref = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('cor');
    params.delete('cat');
    const qs = params.toString();
    const path = slug ? `/catalogo/${slug}` : '/catalogo';
    return qs ? `${path}?${qs}` : path;
  };

  const normalizedQuery = normalizeText(query);
  const usosById = React.useMemo(
    () => new Map(produtos.map((p) => [p.id, usosDoProduto(p)])),
    [produtos],
  );

  const inCategory = React.useMemo(
    () => produtos.filter((p) => !activeCat || p.categoria.slug === activeCat.slug),
    [produtos, activeCat],
  );
  // usos available here (only show filters that return something)
  const usoOptions = USOS.filter((u) =>
    inCategory.some((p) => usosById.get(p.id)?.includes(u.slug)),
  );

  const base = React.useMemo(
    () =>
      inCategory.filter(
        (p) =>
          (!uso || usosById.get(p.id)?.includes(uso)) &&
          (!normalizedQuery || normalizeText(p.nome).includes(normalizedQuery)),
      ),
    [inCategory, uso, usosById, normalizedQuery],
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

  const filterCount = (uso ? 1 : 0) + selectedColors.size + (sort !== 'ordem' ? 1 : 0);
  const hasFilters = Boolean(query || filterCount);

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

  const usoChips = (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        type="button"
        aria-pressed={!uso}
        onClick={() => updateParams({ uso: null })}
        className={cn(chip, !uso ? chipOn : chipOff)}
      >
        Qualquer uso
      </button>
      {usoOptions.map((u) => (
        <button
          key={u.slug}
          type="button"
          aria-pressed={uso === u.slug}
          onClick={() => updateParams({ uso: uso === u.slug ? null : u.slug })}
          className={cn(chip, uso === u.slug ? chipOn : chipOff)}
        >
          {u.nome}
        </button>
      ))}
    </div>
  );

  const colorChips =
    colorOptions.length > 0 ? (
      <div className="flex flex-wrap gap-2">
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
                'flex min-h-11 items-center gap-2 rounded-full border py-1 pr-3.5 pl-1.5 text-sm font-medium transition-colors',
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
    ) : (
      <p className="text-muted text-sm">Sem opções de cor para esta seleção.</p>
    );

  const sortSelect = (id: string) => (
    <>
      <label htmlFor={id} className="sr-only">
        Ordenar produtos
      </label>
      <select
        id={id}
        value={sort}
        onChange={(e) => updateParams({ ord: e.target.value === 'nome' ? 'nome' : null })}
        className="border-line text-ink hover:border-brand-green/40 h-11 w-full rounded-[10px] border bg-white px-3 text-sm font-medium sm:w-auto"
      >
        <option value="ordem">Ordem do catálogo</option>
        <option value="nome">Nome A–Z</option>
      </select>
    </>
  );

  return (
    <div id="lista-produtos" className="scroll-mt-16">
      {/* ------------------------------ sticky controls ------------------------------ */}
      <div className="border-line bg-offwhite/95 sticky top-[68px] z-20 border-b backdrop-blur-md">
        <div className="container-site py-2.5 sm:py-3">
          <nav aria-label="Linhas do catálogo">
            <ul className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {tabs.map((tab) => {
                const active = (activeCat?.slug ?? '') === tab.slug;
                return (
                  <li key={tab.slug || 'todos'} className="shrink-0 snap-start">
                    <Link
                      href={categoryHref(tab.slug)}
                      scroll={false}
                      aria-current={active ? 'page' : undefined}
                      className={cn(chip, active ? chipOn : chipOff)}
                    >
                      {tab.nome}
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-xs leading-none font-semibold tabular-nums',
                          active ? 'bg-brand-orange text-brand-green-dark' : 'bg-sand text-muted',
                        )}
                      >
                        {tab.total}
                        <span className="sr-only">
                          {' '}
                          {pluralize(tab.total, 'produto', 'produtos')}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-2 flex gap-2 sm:mt-2.5 sm:gap-2.5">
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
                placeholder="Buscar: cobogó, borda, piso…"
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

            {/* phones: everything else lives in a bottom sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'font-heading relative inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border px-3.5 text-sm font-semibold lg:hidden',
                    filterCount
                      ? 'border-brand-green bg-brand-green text-white'
                      : 'border-line text-brand-green bg-white',
                  )}
                >
                  <SlidersHorizontal className="size-[1.1rem]" aria-hidden />
                  Filtros
                  {filterCount ? (
                    <span className="bg-brand-orange text-brand-green-dark grid min-w-5 place-items-center rounded-full px-1 text-[0.7rem] leading-5 font-bold">
                      {filterCount}
                    </span>
                  ) : null}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" title="Filtrar produtos">
                <div className="space-y-6 overflow-y-auto px-5 py-5">
                  <fieldset>
                    <legend className="text-ink mb-2.5 text-sm font-semibold">
                      Onde vai usar?
                    </legend>
                    {usoChips}
                  </fieldset>
                  <fieldset>
                    <legend className="text-ink mb-2.5 text-sm font-semibold">Cor</legend>
                    {colorChips}
                  </fieldset>
                  <div>
                    <p className="text-ink mb-2.5 text-sm font-semibold">Ordenar</p>
                    {sortSelect('ordem-catalogo-celular')}
                  </div>
                </div>
                <div className="border-line flex gap-2.5 border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  {hasFilters ? (
                    <Button variant="outline" onClick={clearAll} className="shrink-0">
                      Limpar
                    </Button>
                  ) : null}
                  <SheetClose asChild>
                    <Button variant="green" className="flex-1">
                      Ver {filtered.length} {pluralize(filtered.length, 'produto', 'produtos')}
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden shrink-0 lg:block">{sortSelect('ordem-catalogo')}</div>
          </div>
        </div>
      </div>

      {/* --------------------------------- content ---------------------------------- */}
      <div className="container-site pt-5 pb-16 sm:pt-6 sm:pb-20">
        {/* desktop filters */}
        <div className="mb-6 hidden space-y-4 lg:block">
          {usoOptions.length > 1 ? (
            <fieldset>
              <legend className="text-ink mb-2 text-sm font-semibold">Onde vai usar?</legend>
              {usoChips}
            </fieldset>
          ) : null}
          {colorOptions.length > 0 ? (
            <fieldset className="min-w-0">
              <legend className="text-ink mb-2 text-sm font-semibold">Filtrar por cor</legend>
              {colorChips}
            </fieldset>
          ) : null}
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:mb-6">
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
                  Catálogo em PDF
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
          <div className="space-y-12 sm:space-y-14">
            {groups.map((group, groupIndex) => (
              <section
                key={group.categoria.id}
                id={group.categoria.slug}
                aria-labelledby={`titulo-${group.categoria.slug}`}
                className="scroll-mt-52"
              >
                {!activeCat ? (
                  <div className="border-line mb-4 flex items-end justify-between gap-3 border-b pb-3 sm:mb-5">
                    <div className="min-w-0">
                      <SectionLabel>
                        {group.itens.length} {pluralize(group.itens.length, 'modelo', 'modelos')}
                      </SectionLabel>
                      <h2
                        id={`titulo-${group.categoria.slug}`}
                        className="font-heading text-brand-green mt-1 text-xl font-bold sm:text-[1.7rem]"
                      >
                        {group.categoria.nome}
                      </h2>
                    </div>
                    <Link
                      href={categoryHref(group.categoria.slug)}
                      className="text-brand-green inline-flex min-h-11 shrink-0 items-center text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      Ver linha
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
      <div className="border-line bg-offwhite border-b">
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
      <div className="container-site pt-6 pb-20">
        <ul className={GRID}>
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="border-line overflow-hidden rounded-[12px] border bg-white">
              <div className="bg-line/70 aspect-square animate-pulse sm:aspect-[4/3]" />
              <div className="space-y-3 p-3 sm:p-5">
                <div className="bg-line/70 h-5 w-2/3 animate-pulse rounded" />
                <div className="bg-line/60 h-4 w-1/2 animate-pulse rounded" />
                <div className="bg-line/60 h-11 animate-pulse rounded-[10px]" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
