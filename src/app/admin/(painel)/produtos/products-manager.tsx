'use client';
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, EyeOff, Info, Pencil, Search, Star, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { SortableList } from '@/components/admin/sortable-list';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { withToast } from '@/lib/admin/use-action';
import { BLUR_DATA_URL } from '@/lib/site';
import { normalizeText, pluralize } from '@/lib/text';
import { cn } from '@/lib/utils';
import {
  deleteProdutos,
  duplicateProduto,
  reorderProdutos,
  setProdutoDestaque,
  setProdutosAtivo,
} from './actions';

export interface AdminProduto {
  id: string;
  nome: string;
  slug: string;
  categoria_id: string;
  ativo: boolean;
  destaque: boolean;
  ordem: number;
  imagem: string | null;
  cores: number;
}
interface AdminCategoria {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  ativo: boolean;
}

export function ProductsManager({
  initialProdutos,
  categorias,
  initialCategoria,
  initialStatus,
}: {
  initialProdutos: AdminProduto[];
  categorias: AdminCategoria[];
  initialCategoria: string;
  initialStatus: '' | 'ativos' | 'inativos';
}) {
  const router = useRouter();
  const [produtos, setProdutos] = React.useState(initialProdutos);
  React.useEffect(() => setProdutos(initialProdutos), [initialProdutos]);

  const [search, setSearch] = React.useState('');
  const [categoria, setCategoria] = React.useState(
    categorias.some((c) => c.id === initialCategoria) ? initialCategoria : '',
  );
  const [status, setStatus] = React.useState(initialStatus);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [toDelete, setToDelete] = React.useState<AdminProduto[] | null>(null);
  const [pending, startTransition] = React.useTransition();

  const q = normalizeText(search);
  const filtering = Boolean(q || status);
  const visible = produtos.filter(
    (p) =>
      (!categoria || p.categoria_id === categoria) &&
      (!q || normalizeText(p.nome).includes(q)) &&
      (!status || (status === 'ativos' ? p.ativo : !p.ativo)),
  );
  const groups = categorias
    .filter((c) => !categoria || c.id === categoria)
    .map((c) => ({ categoria: c, itens: visible.filter((p) => p.categoria_id === c.id) }))
    .filter((g) => g.itens.length > 0);

  const patch = (ids: string[], changes: Partial<AdminProduto>) =>
    setProdutos((list) => list.map((p) => (ids.includes(p.id) ? { ...p, ...changes } : p)));

  function toggleAtivo(ids: string[], ativo: boolean) {
    const before = produtos;
    patch(ids, { ativo }); // immediate feedback
    startTransition(async () => {
      const result = await withToast(setProdutosAtivo(ids, ativo));
      if (!result.ok) setProdutos(before);
      else setSelected(new Set());
      router.refresh();
    });
  }

  function toggleDestaque(p: AdminProduto) {
    const before = produtos;
    patch([p.id], { destaque: !p.destaque });
    startTransition(async () => {
      const result = await withToast(setProdutoDestaque(p.id, !p.destaque));
      if (!result.ok) setProdutos(before);
      router.refresh();
    });
  }

  function reorder(ordered: AdminProduto[]) {
    const before = produtos;
    const order = new Map(ordered.map((p, i) => [p.id, i + 1]));
    setProdutos((list) =>
      list
        .map((p) => (order.has(p.id) ? { ...p, ordem: order.get(p.id)! } : p))
        .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)),
    );
    startTransition(async () => {
      const result = await withToast(reorderProdutos(ordered.map((p) => p.id)));
      if (!result.ok) setProdutos(before);
      router.refresh();
    });
  }

  function duplicate(p: AdminProduto) {
    startTransition(async () => {
      const result = await withToast(duplicateProduto(p.id));
      if (result.ok) router.push(`/admin/produtos/${result.data.id}`);
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    const ids = toDelete.map((p) => p.id);
    startTransition(async () => {
      const result = await withToast(deleteProdutos(ids));
      if (result.ok) {
        setProdutos((list) => list.filter((p) => !ids.includes(p.id)));
        setSelected(new Set());
      }
      setToDelete(null);
      router.refresh();
    });
  }

  const selectedList = produtos.filter((p) => selected.has(p.id));
  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));
  const iconBtn = 'grid size-11 place-items-center rounded-lg';

  return (
    <div>
      {/* filters */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <label htmlFor="admin-busca" className="sr-only">
            Buscar produto pelo nome
          </label>
          <Search
            className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-[1.1rem] -translate-y-1/2"
            aria-hidden
          />
          <input
            id="admin-busca"
            type="search"
            placeholder="Buscar pelo nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-line placeholder:text-muted/70 focus-visible:border-brand-green h-12 w-full rounded-[10px] border bg-white pr-3 pl-10 text-base"
          />
        </div>
        <div>
          <label htmlFor="admin-categoria" className="sr-only">
            Filtrar por categoria
          </label>
          <Select
            id="admin-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="admin-status" className="sr-only">
            Filtrar por situação
          </label>
          <Select
            id="admin-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="">Ativos e desativados</option>
            <option value="ativos">Só ativos</option>
            <option value="inativos">Só desativados</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="text-ink flex min-h-11 items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            className="accent-brand-green size-5"
            checked={allVisibleSelected}
            onChange={(e) =>
              setSelected(e.target.checked ? new Set(visible.map((p) => p.id)) : new Set())
            }
          />
          Selecionar todos ({visible.length})
        </label>
        <p className="text-muted text-sm" role="status">
          {visible.length} {pluralize(visible.length, 'produto', 'produtos')}
        </p>
      </div>

      {filtering ? (
        <p className="bg-sand text-muted mt-2 flex items-start gap-2 rounded-[10px] px-3.5 py-2.5 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Para mudar a ordem dos produtos, limpe a busca e o filtro de situação.
        </p>
      ) : null}

      {groups.length === 0 ? (
        <div className="border-line mt-6 rounded-[12px] border border-dashed bg-white p-10 text-center">
          <p className="font-heading text-brand-green text-lg font-semibold">
            Nenhum produto encontrado
          </p>
          <p className="text-muted mt-1">Mude os filtros ou cadastre um produto novo.</p>
          <Button asChild className="mt-5">
            <Link href="/admin/produtos/novo">Cadastrar produto</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-8">
          {groups.map((group) => (
            <section key={group.categoria.id} aria-labelledby={`grupo-${group.categoria.id}`}>
              <h2
                id={`grupo-${group.categoria.id}`}
                className="font-heading text-brand-green mb-2.5 flex flex-wrap items-center gap-2.5 text-base font-semibold"
              >
                <span aria-hidden className="bg-brand-orange inline-block size-2.5" />
                {group.categoria.nome}
                <span className="text-muted text-sm font-medium">({group.itens.length})</span>
                {!group.categoria.ativo ? (
                  <span className="bg-sand text-muted rounded px-1.5 py-0.5 text-xs font-semibold">
                    categoria desativada
                  </span>
                ) : null}
              </h2>
              <SortableList
                items={group.itens}
                getId={(p) => p.id}
                getLabel={(p) => p.nome}
                disabled={filtering}
                onReorder={reorder}
                className="border-line shadow-soft overflow-hidden rounded-[12px] border bg-white"
                itemClassName="border-b border-line bg-white last:border-b-0"
                renderItem={(p, { handle }) => (
                  <div
                    data-testid="produto-row"
                    className={cn(
                      'grid grid-cols-[auto_auto_1fr] items-center gap-x-2 gap-y-2 p-2.5 sm:grid-cols-[auto_auto_1fr_auto] sm:gap-x-3 sm:p-3',
                      !p.ativo && 'bg-sand/50',
                    )}
                  >
                    <label className="grid size-9 place-items-center">
                      <span className="sr-only">Selecionar {p.nome}</span>
                      <input
                        type="checkbox"
                        className="accent-brand-green size-5"
                        checked={selected.has(p.id)}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(p.id);
                          else next.delete(p.id);
                          setSelected(next);
                        }}
                      />
                    </label>
                    {handle}
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="bg-sand relative size-14 shrink-0 overflow-hidden rounded-lg">
                        {p.imagem ? (
                          <Image
                            src={p.imagem}
                            alt=""
                            fill
                            sizes="56px"
                            placeholder="blur"
                            blurDataURL={BLUR_DATA_URL}
                            className={cn('object-cover', !p.ativo && 'opacity-60 grayscale')}
                          />
                        ) : (
                          <span className="text-muted grid size-full place-items-center text-[0.6rem] font-semibold">
                            sem foto
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/produtos/${p.id}`}
                          className="font-heading text-ink hover:text-brand-green block truncate font-semibold hover:underline"
                        >
                          {p.nome}
                        </Link>
                        <p className="text-muted flex flex-wrap items-center gap-x-2 text-sm">
                          <span>
                            {p.cores} {pluralize(p.cores, 'cor', 'cores')}
                          </span>
                          {!p.ativo ? (
                            <span className="text-ink/70 flex items-center gap-1 font-semibold">
                              <EyeOff className="size-3.5" aria-hidden />
                              desativado
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="border-line col-span-3 flex items-center justify-between gap-1 border-t pt-2 sm:col-span-1 sm:justify-end sm:border-t-0 sm:pt-0">
                      <label className="text-ink mr-1 flex items-center gap-2 text-sm font-medium sm:mr-2">
                        <Switch
                          checked={p.ativo}
                          onCheckedChange={(checked) => toggleAtivo([p.id], checked)}
                          aria-label={`${p.nome}: ${p.ativo ? 'ativo, toque para desativar' : 'desativado, toque para ativar'}`}
                        />
                        <span className="w-[4.6rem] sm:hidden lg:inline">
                          {p.ativo ? 'Ativo' : 'Desativado'}
                        </span>
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => toggleDestaque(p)}
                          aria-pressed={p.destaque}
                          aria-label={
                            p.destaque
                              ? `Tirar ${p.nome} dos destaques`
                              : `Destacar ${p.nome} na página inicial`
                          }
                          title={
                            p.destaque
                              ? 'Em destaque na página inicial'
                              : 'Destacar na página inicial'
                          }
                          className={cn(iconBtn, 'hover:bg-sand')}
                        >
                          <Star
                            className={cn(
                              'size-5',
                              p.destaque ? 'fill-brand-orange text-brand-orange' : 'text-muted',
                            )}
                            aria-hidden
                          />
                        </button>
                        <Link
                          href={`/admin/produtos/${p.id}`}
                          aria-label={`Editar ${p.nome}`}
                          title="Editar"
                          className={cn(iconBtn, 'text-brand-green hover:bg-sand')}
                        >
                          <Pencil className="size-5" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          onClick={() => duplicate(p)}
                          disabled={pending}
                          aria-label={`Duplicar ${p.nome}`}
                          title="Duplicar"
                          className={cn(
                            iconBtn,
                            'text-brand-green hover:bg-sand disabled:opacity-50',
                          )}
                        >
                          <Copy className="size-5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete([p])}
                          aria-label={`Excluir ${p.nome}`}
                          title="Excluir"
                          className={cn(iconBtn, 'text-danger hover:bg-danger/8')}
                        >
                          <Trash2 className="size-5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              />
            </section>
          ))}
        </div>
      )}

      {/* bulk actions */}
      {selectedList.length > 0 ? (
        <div
          role="region"
          aria-label="Ações para os produtos selecionados"
          className="bg-brand-green-dark shadow-lift fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 rounded-[12px] p-2.5 pl-4 text-white lg:bottom-6 lg:left-64"
        >
          <span className="flex items-center gap-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              aria-label="Limpar seleção"
              className="-ml-2 grid size-9 place-items-center rounded-full hover:bg-white/15"
            >
              <X className="size-4" aria-hidden />
            </button>
            {selectedList.length} {pluralize(selectedList.length, 'selecionado', 'selecionados')}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outlineLight"
              disabled={pending}
              onClick={() =>
                toggleAtivo(
                  selectedList.map((p) => p.id),
                  true,
                )
              }
            >
              Ativar
            </Button>
            <Button
              size="sm"
              variant="outlineLight"
              disabled={pending}
              onClick={() =>
                toggleAtivo(
                  selectedList.map((p) => p.id),
                  false,
                )
              }
            >
              Desativar
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={pending}
              onClick={() => setToDelete(selectedList)}
            >
              Excluir
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={
          toDelete && toDelete.length > 1
            ? `Excluir ${toDelete.length} produtos?`
            : `Excluir “${toDelete?.[0]?.nome ?? ''}”?`
        }
        description="Esta ação não pode ser desfeita. As fotos do produto também serão apagadas."
        confirmLabel="Excluir definitivamente"
        pending={pending}
        onConfirm={confirmDelete}
      >
        {toDelete?.some((p) => p.ativo) ? (
          <div className="border-brand-green/25 bg-brand-green/5 rounded-[10px] border p-3.5">
            <p className="text-ink text-sm">
              <strong>Sugestão:</strong> se o produto só saiu de linha por um tempo, desative em vez
              de excluir. Ele some do site, mas continua guardado aqui.
            </p>
            <Button
              variant="green"
              size="sm"
              className="mt-3"
              disabled={pending}
              onClick={() => {
                const ids = toDelete.map((p) => p.id);
                setToDelete(null);
                toggleAtivo(ids, false);
              }}
            >
              <EyeOff />
              Desativar em vez de excluir
            </Button>
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
