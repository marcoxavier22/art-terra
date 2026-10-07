'use client';
import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { IMAGE_ACCEPT, ProgressBar, useImageUpload } from '@/components/admin/image-uploader';
import { Card } from '@/components/admin/page-title';
import { SortableList } from '@/components/admin/sortable-list';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { discardUpload } from '@/lib/admin/upload';
import { withToast } from '@/lib/admin/use-action';
import { BLUR_DATA_URL } from '@/lib/site';
import type { GaleriaItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  addGaleriaItens,
  deleteGaleriaItem,
  reorderGaleria,
  setGaleriaAtivo,
  updateGaleriaItem,
} from './actions';

interface Draft {
  imagem_url: string;
  alt: string;
  legenda: string;
}

const ALT_HINT =
  'Descreva o que aparece na foto, como se contasse a alguém por telefone. Ajuda pessoas com deficiência visual e o Google. Ex.: “Muro de cobogós florais em área de piscina”.';

export function GalleryManager({ initial }: { initial: GaleriaItem[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  React.useEffect(() => setItems(initial), [initial]);

  const [drafts, setDrafts] = React.useState<Draft[]>([]);
  const [draftErrors, setDraftErrors] = React.useState<Record<string, string>>({});
  const [editing, setEditing] = React.useState<GaleriaItem | null>(null);
  const [editForm, setEditForm] = React.useState({ alt: '', legenda: '', ativo: true });
  const [editErrors, setEditErrors] = React.useState<Record<string, string>>({});
  const [toDelete, setToDelete] = React.useState<GaleriaItem | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [dragOver, setDragOver] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { progress, upload } = useImageUpload('galeria', 'obra');

  async function addFiles(files: FileList | null) {
    if (!files?.length || progress !== null) return;
    const urls = await upload(Array.from(files).slice(0, 30));
    setDrafts((d) => [...d, ...urls.map((imagem_url) => ({ imagem_url, alt: '', legenda: '' }))]);
  }

  function removeDraft(url: string) {
    void discardUpload(url);
    setDrafts((d) => d.filter((x) => x.imagem_url !== url));
  }

  function publishDrafts() {
    const errors: Record<string, string> = {};
    drafts.forEach((d, i) => {
      if (d.alt.trim().length < 5) errors[`${i}.alt`] = 'Descreva a foto (mínimo de 5 letras).';
    });
    setDraftErrors(errors);
    if (Object.keys(errors).length) return;
    startTransition(async () => {
      const result = await withToast(addGaleriaItens(drafts.map((d) => ({ ...d, ativo: true }))));
      if (result.ok) {
        setDrafts([]);
        router.refresh();
      } else {
        setDraftErrors(result.fieldErrors ?? {});
      }
    });
  }

  function toggle(item: GaleriaItem, ativo: boolean) {
    const before = items;
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, ativo } : i)));
    startTransition(async () => {
      const result = await withToast(setGaleriaAtivo(item.id, ativo));
      if (!result.ok) setItems(before);
      router.refresh();
    });
  }

  function reorder(ordered: GaleriaItem[]) {
    const before = items;
    setItems(ordered);
    startTransition(async () => {
      const result = await withToast(reorderGaleria(ordered.map((i) => i.id)));
      if (!result.ok) setItems(before);
      router.refresh();
    });
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    startTransition(async () => {
      const result = await withToast(updateGaleriaItem(editing.id, editForm));
      if (result.ok) {
        setEditing(null);
        router.refresh();
      } else {
        setEditErrors(result.fieldErrors ?? {});
      }
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    startTransition(async () => {
      const result = await withToast(deleteGaleriaItem(toDelete.id));
      if (result.ok) setItems((list) => list.filter((i) => i.id !== toDelete.id));
      setToDelete(null);
      router.refresh();
    });
  }

  const iconBtn = 'grid size-11 place-items-center rounded-lg';

  return (
    <div className="space-y-6">
      <Card title="Adicionar fotos" description="Pode escolher várias de uma vez.">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void addFiles(e.dataTransfer.files);
          }}
          className={cn(
            'rounded-[12px] border-2 border-dashed p-6 text-center transition-colors',
            dragOver ? 'border-brand-orange bg-brand-orange/10' : 'border-line bg-sand/60',
          )}
        >
          {progress !== null ? (
            <div className="mx-auto max-w-xs space-y-2.5">
              <Loader2 className="text-brand-green mx-auto size-7 animate-spin" aria-hidden />
              <ProgressBar value={progress} label="Enviando fotos" />
              <p className="text-sm font-semibold">Enviando… {progress}%</p>
            </div>
          ) : (
            <>
              <Button variant="green" onClick={() => fileRef.current?.click()}>
                <ImagePlus />
                Escolher fotos
              </Button>
              <p className="text-muted mt-2 hidden text-sm sm:block">ou arraste as fotos para cá</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {drafts.length > 0 ? (
          <div className="mt-5">
            <p className="font-heading text-brand-green mb-1 font-semibold">
              Falta só descrever {drafts.length === 1 ? 'a foto' : 'as fotos'}
            </p>
            <p className="text-muted mb-3 text-sm">{ALT_HINT}</p>
            <ul className="space-y-3">
              {drafts.map((d, i) => (
                <li
                  key={d.imagem_url}
                  className="border-line bg-offwhite grid gap-3 rounded-[10px] border p-3 sm:grid-cols-[9rem_1fr_auto]"
                >
                  <span className="bg-sand relative aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={d.imagem_url}
                      alt="Prévia da foto enviada"
                      fill
                      sizes="(min-width: 640px) 144px, 90vw"
                      className="object-cover"
                    />
                  </span>
                  <div className="space-y-2.5">
                    <Field
                      label="Descrição da foto"
                      htmlFor={`draft-alt-${i}`}
                      error={draftErrors[`${i}.alt`]}
                    >
                      <Input
                        id={`draft-alt-${i}`}
                        value={d.alt}
                        maxLength={200}
                        aria-invalid={Boolean(draftErrors[`${i}.alt`])}
                        onChange={(e) =>
                          setDrafts((list) =>
                            list.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)),
                          )
                        }
                      />
                    </Field>
                    <Field label="Legenda" htmlFor={`draft-legenda-${i}`} optional>
                      <Input
                        id={`draft-legenda-${i}`}
                        value={d.legenda}
                        maxLength={120}
                        placeholder="Ex.: Residência em Volta Redonda"
                        onChange={(e) =>
                          setDrafts((list) =>
                            list.map((x, j) => (j === i ? { ...x, legenda: e.target.value } : x)),
                          )
                        }
                      />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDraft(d.imagem_url)}
                    aria-label={`Descartar foto ${i + 1}`}
                    className={cn(iconBtn, 'text-danger hover:bg-danger/8')}
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="green" className="mt-4" disabled={pending} onClick={publishDrafts}>
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              Publicar {drafts.length === 1 ? 'foto' : `${drafts.length} fotos`} na galeria
            </Button>
          </div>
        ) : null}
      </Card>

      <section aria-labelledby="galeria-lista">
        <h2
          id="galeria-lista"
          className="font-heading text-brand-green mb-2.5 text-lg font-semibold"
        >
          Fotos na galeria ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="border-line text-muted rounded-[12px] border border-dashed bg-white p-8 text-center">
            A galeria está vazia. Enquanto não houver fotos, a seção não aparece na página inicial.
          </p>
        ) : (
          <SortableList
            items={items}
            getId={(i) => i.id}
            getLabel={(i) => i.alt}
            onReorder={reorder}
            className="border-line shadow-soft overflow-hidden rounded-[12px] border bg-white"
            itemClassName="border-b border-line bg-white last:border-b-0"
            renderItem={(item, { handle }) => (
              <div
                className={cn(
                  'grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2 p-2.5 sm:grid-cols-[auto_1fr_auto] sm:gap-x-3 sm:p-3',
                  !item.ativo && 'bg-sand/50',
                )}
              >
                {handle}
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-sand relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.imagem_url}
                      alt=""
                      fill
                      sizes="96px"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className={cn('object-cover', !item.ativo && 'opacity-60 grayscale')}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-ink line-clamp-2 text-sm font-medium">{item.alt}</p>
                    {item.legenda ? (
                      <p className="text-muted truncate text-sm">Legenda: {item.legenda}</p>
                    ) : null}
                  </div>
                </div>
                <div className="border-line col-span-2 flex items-center justify-between gap-1 border-t pt-2 sm:col-span-1 sm:justify-end sm:border-t-0 sm:pt-0">
                  <label className="text-ink mr-2 flex items-center gap-2 text-sm font-medium">
                    <Switch
                      checked={item.ativo}
                      onCheckedChange={(checked) => toggle(item, checked)}
                      aria-label={`Foto “${item.alt}”: ${item.ativo ? 'visível, toque para esconder' : 'escondida, toque para mostrar'}`}
                    />
                    <span className="w-[4.4rem]">{item.ativo ? 'Visível' : 'Escondida'}</span>
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(item);
                        setEditErrors({});
                        setEditForm({
                          alt: item.alt,
                          legenda: item.legenda ?? '',
                          ativo: item.ativo,
                        });
                      }}
                      aria-label={`Editar foto “${item.alt}”`}
                      title="Editar"
                      className={cn(iconBtn, 'text-brand-green hover:bg-sand')}
                    >
                      <Pencil className="size-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(item)}
                      aria-label={`Excluir foto “${item.alt}”`}
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
      </section>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Editar foto" className="max-w-lg">
          <form onSubmit={saveEdit} noValidate className="space-y-4">
            <Field
              label="Descrição da foto"
              htmlFor="gal-alt"
              error={editErrors.alt}
              hint={ALT_HINT}
            >
              <Input
                id="gal-alt"
                value={editForm.alt}
                maxLength={200}
                aria-invalid={Boolean(editErrors.alt)}
                onChange={(e) => setEditForm((f) => ({ ...f, alt: e.target.value }))}
              />
            </Field>
            <Field label="Legenda" htmlFor="gal-legenda" optional error={editErrors.legenda}>
              <Input
                id="gal-legenda"
                value={editForm.legenda}
                maxLength={120}
                onChange={(e) => setEditForm((f) => ({ ...f, legenda: e.target.value }))}
              />
            </Field>
            <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setEditing(null)} disabled={pending}>
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
        title="Excluir esta foto?"
        description="Esta ação não pode ser desfeita. Para só tirar do site, use o botão Visível/Escondida."
        confirmLabel="Excluir definitivamente"
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
