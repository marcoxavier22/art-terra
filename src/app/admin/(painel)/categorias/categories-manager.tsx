'use client';
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { ImageUploader } from '@/components/admin/image-uploader';
import { SortableList } from '@/components/admin/sortable-list';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input, Textarea } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { discardUpload } from '@/lib/admin/upload';
import { withToast } from '@/lib/admin/use-action';
import { BLUR_DATA_URL } from '@/lib/site';
import { pluralize, slugify } from '@/lib/text';
import { cn } from '@/lib/utils';
import { deleteCategoria, reorderCategorias, saveCategoria, setCategoriaAtivo } from './actions';

export interface AdminCategoria {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  imagem_capa_url: string | null;
  ordem: number;
  ativo: boolean;
  produtos: number;
}

const EMPTY = {
  nome: '',
  slug: '',
  descricao: '',
  imagem_capa_url: null as string | null,
  ativo: true,
};

export function CategoriesManager({ initial }: { initial: AdminCategoria[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  React.useEffect(() => setItems(initial), [initial]);

  const [editing, setEditing] = React.useState<AdminCategoria | 'new' | null>(null);
  const [form, setForm] = React.useState(EMPTY);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<AdminCategoria | null>(null);
  const [pending, startTransition] = React.useTransition();

  function open(target: AdminCategoria | 'new') {
    setEditing(target);
    setErrors({});
    setSlugTouched(target !== 'new');
    setForm(
      target === 'new'
        ? EMPTY
        : {
            nome: target.nome,
            slug: target.slug,
            descricao: target.descricao ?? '',
            imagem_capa_url: target.imagem_capa_url,
            ativo: target.ativo,
          },
    );
  }

  const savedCover = editing && editing !== 'new' ? editing.imagem_capa_url : null;

  function close() {
    // a cover uploaded and then abandoned would be an orphan file
    if (form.imagem_capa_url && form.imagem_capa_url !== savedCover) {
      void discardUpload(form.imagem_capa_url);
    }
    setEditing(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const id = editing && editing !== 'new' ? editing.id : null;
      const result = await withToast(saveCategoria(id, form));
      if (result.ok) {
        setEditing(null);
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
      }
    });
  }

  function toggle(c: AdminCategoria, ativo: boolean) {
    const before = items;
    setItems((list) => list.map((i) => (i.id === c.id ? { ...i, ativo } : i)));
    startTransition(async () => {
      const result = await withToast(setCategoriaAtivo(c.id, ativo));
      if (!result.ok) setItems(before);
      router.refresh();
    });
  }

  function reorder(ordered: AdminCategoria[]) {
    const before = items;
    setItems(ordered);
    startTransition(async () => {
      const result = await withToast(reorderCategorias(ordered.map((c) => c.id)));
      if (!result.ok) setItems(before);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    startTransition(async () => {
      const result = await withToast(deleteCategoria(toDelete.id));
      if (result.ok) setItems((list) => list.filter((i) => i.id !== toDelete.id));
      setToDelete(null);
      router.refresh();
    });
  }

  const iconBtn = 'grid size-11 place-items-center rounded-lg';

  return (
    <div>
      <Button onClick={() => open('new')}>
        <Plus />
        Nova categoria
      </Button>

      {items.length === 0 ? (
        <p className="border-line text-muted mt-5 rounded-[12px] border border-dashed bg-white p-8 text-center">
          Nenhuma categoria cadastrada ainda.
        </p>
      ) : (
        <SortableList
          items={items}
          getId={(c) => c.id}
          getLabel={(c) => c.nome}
          onReorder={reorder}
          className="border-line shadow-soft mt-5 overflow-hidden rounded-[12px] border bg-white"
          itemClassName="border-b border-line bg-white last:border-b-0"
          renderItem={(c, { handle }) => (
            <div
              className={cn(
                'grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2 p-2.5 sm:grid-cols-[auto_1fr_auto] sm:gap-x-3 sm:p-3',
                !c.ativo && 'bg-sand/50',
              )}
            >
              {handle}
              <div className="flex min-w-0 items-center gap-3">
                <span className="bg-sand relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  {c.imagem_capa_url ? (
                    <Image
                      src={c.imagem_capa_url}
                      alt=""
                      fill
                      sizes="80px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className={cn('object-cover', !c.ativo && 'opacity-60 grayscale')}
                    />
                  ) : (
                    <span className="text-muted grid size-full place-items-center text-[0.6rem] font-semibold">
                      sem capa
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-ink truncate font-semibold">{c.nome}</p>
                  <p className="text-muted text-sm">
                    <Link
                      href={`/admin/produtos?categoria=${c.id}`}
                      className="hover:text-brand-green underline-offset-2 hover:underline"
                    >
                      {c.produtos} {pluralize(c.produtos, 'produto', 'produtos')}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="border-line col-span-2 flex items-center justify-between gap-1 border-t pt-2 sm:col-span-1 sm:justify-end sm:border-t-0 sm:pt-0">
                <label className="text-ink mr-2 flex items-center gap-2 text-sm font-medium">
                  <Switch
                    checked={c.ativo}
                    onCheckedChange={(checked) => toggle(c, checked)}
                    aria-label={`${c.nome}: ${c.ativo ? 'ativa, toque para desativar' : 'desativada, toque para ativar'}`}
                  />
                  <span className="w-[4.6rem]">{c.ativo ? 'Ativa' : 'Desativada'}</span>
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => open(c)}
                    aria-label={`Editar ${c.nome}`}
                    title="Editar"
                    className={cn(iconBtn, 'text-brand-green hover:bg-sand')}
                  >
                    <Pencil className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(c)}
                    aria-label={`Excluir ${c.nome}`}
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
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent
          title={editing === 'new' ? 'Nova categoria' : 'Editar categoria'}
          className="max-w-xl"
        >
          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="Nome" htmlFor="cat-nome" error={errors.nome}>
              <Input
                id="cat-nome"
                value={form.nome}
                maxLength={80}
                placeholder="Ex.: Cobogós"
                aria-invalid={Boolean(errors.nome)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nome: e.target.value,
                    slug: slugTouched ? f.slug : slugify(e.target.value),
                  }))
                }
              />
            </Field>
            <Field
              label="Endereço (slug)"
              htmlFor="cat-slug"
              error={errors.slug}
              hint={`Usado no link: /catalogo/${form.slug || 'nome'}. Evite mudar depois de divulgar.`}
            >
              <Input
                id="cat-slug"
                value={form.slug}
                maxLength={80}
                spellCheck={false}
                autoCapitalize="none"
                className="font-mono text-[0.95rem]"
                aria-invalid={Boolean(errors.slug)}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
                onBlur={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              />
            </Field>
            <Field
              label="Descrição"
              htmlFor="cat-descricao"
              optional
              error={errors.descricao}
              hint="Aparece no topo do catálogo quando esta categoria é escolhida."
            >
              <Textarea
                id="cat-descricao"
                rows={3}
                maxLength={600}
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </Field>
            <ImageUploader
              id="cat-capa"
              label="Imagem de capa (opcional)"
              hint="Usada no cartão da categoria na página inicial."
              value={form.imagem_capa_url}
              onChange={(url) => {
                if (form.imagem_capa_url && form.imagem_capa_url !== savedCover) {
                  void discardUpload(form.imagem_capa_url);
                }
                setForm((f) => ({ ...f, imagem_capa_url: url }));
              }}
              folder="categorias"
              baseName={form.slug || 'categoria'}
              aspect="aspect-[16/9]"
            />
            <label className="flex items-center gap-3">
              <Switch
                checked={form.ativo}
                onCheckedChange={(ativo) => setForm((f) => ({ ...f, ativo }))}
              />
              <span className="text-ink font-semibold">
                {form.ativo ? 'Ativa: aparece no site' : 'Desativada: escondida do site'}
              </span>
            </label>
            <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={close} disabled={pending}>
                Cancelar
              </Button>
              <Button type="submit" variant="green" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Excluir “${toDelete?.nome ?? ''}”?`}
        description={
          toDelete && toDelete.produtos > 0
            ? `Esta categoria tem ${toDelete.produtos} ${pluralize(toDelete.produtos, 'produto', 'produtos')} e não pode ser excluída. Mova ou exclua os produtos antes — ou apenas desative a categoria.`
            : 'Esta ação não pode ser desfeita.'
        }
        confirmLabel="Excluir definitivamente"
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
