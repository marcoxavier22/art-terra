'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ColorDialog } from '@/components/admin/color-dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { SortableList } from '@/components/admin/sortable-list';
import { Button } from '@/components/ui/button';
import { withToast } from '@/lib/admin/use-action';
import { pluralize } from '@/lib/text';
import type { Cor } from '@/lib/types';
import { cn } from '@/lib/utils';
import { deleteCor, reorderCores } from './actions';

export interface AdminCor extends Cor {
  produtos: number;
}

export function ColorsManager({ initial }: { initial: AdminCor[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  React.useEffect(() => setItems(initial), [initial]);
  const [dialog, setDialog] = React.useState<{ cor: AdminCor | null } | null>(null);
  const [toDelete, setToDelete] = React.useState<AdminCor | null>(null);
  const [pending, startTransition] = React.useTransition();

  function reorder(ordered: AdminCor[]) {
    const before = items;
    setItems(ordered);
    startTransition(async () => {
      const result = await withToast(reorderCores(ordered.map((c) => c.id)));
      if (!result.ok) setItems(before);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    startTransition(async () => {
      const result = await withToast(deleteCor(toDelete.id));
      if (result.ok) setItems((list) => list.filter((i) => i.id !== toDelete.id));
      setToDelete(null);
      router.refresh();
    });
  }

  const iconBtn = 'grid size-11 place-items-center rounded-lg';

  return (
    <div>
      <Button onClick={() => setDialog({ cor: null })}>
        <Plus />
        Nova cor
      </Button>

      {items.length === 0 ? (
        <p className="border-line text-muted mt-5 rounded-[12px] border border-dashed bg-white p-8 text-center">
          Nenhuma cor cadastrada ainda.
        </p>
      ) : (
        <SortableList
          items={items}
          getId={(c) => c.id}
          getLabel={(c) => c.nome}
          onReorder={reorder}
          className="border-line shadow-soft mt-5 max-w-2xl overflow-hidden rounded-[12px] border bg-white"
          itemClassName="border-b border-line bg-white last:border-b-0"
          renderItem={(c, { handle }) => (
            <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-2.5">
              {handle}
              <span
                aria-hidden
                className="border-ink/25 size-9 shrink-0 rounded-full border shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]"
                style={{ backgroundColor: c.hex }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-ink truncate font-semibold">{c.nome}</p>
                <p className="text-muted text-sm">
                  <span className="font-mono">{c.hex.toUpperCase()}</span> ·{' '}
                  {c.produtos === 0
                    ? 'sem uso'
                    : `em ${c.produtos} ${pluralize(c.produtos, 'produto', 'produtos')}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDialog({ cor: c })}
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
          )}
        />
      )}

      <ColorDialog
        open={dialog !== null}
        onOpenChange={(o) => !o && setDialog(null)}
        cor={dialog?.cor ?? null}
        onSaved={(saved) => {
          setItems((list) =>
            list.some((i) => i.id === saved.id)
              ? list.map((i) => (i.id === saved.id ? { ...i, ...saved } : i))
              : [...list, { ...saved, produtos: 0 }],
          );
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Excluir a cor “${toDelete?.nome ?? ''}”?`}
        description={
          toDelete && toDelete.produtos > 0
            ? `Esta cor está em uso por ${toDelete.produtos} ${pluralize(toDelete.produtos, 'produto', 'produtos')} e não pode ser excluída. Tire a cor desses produtos antes.`
            : 'Esta ação não pode ser desfeita.'
        }
        confirmLabel="Excluir definitivamente"
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
