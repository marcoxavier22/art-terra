'use client';
import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { saveCor } from '@/app/admin/(painel)/cores/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/form';
import { withToast } from '@/lib/admin/use-action';
import type { Cor } from '@/lib/types';

/** Create or edit a colour: name + colour picker (with the hex code for those who know it). */
export function ColorDialog({
  open,
  onOpenChange,
  cor,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cor: Cor | null;
  onSaved: (cor: Cor) => void;
}) {
  const [nome, setNome] = React.useState('');
  const [hex, setHex] = React.useState('#CCCCCC');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setNome(cor?.nome ?? '');
      setHex(cor?.hex ?? '#CCCCCC');
      setErrors({});
    }
  }, [open, cor]);

  const validHex = /^#[0-9a-fA-F]{6}$/.test(hex);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation(); // this dialog can live inside the product form
    setPending(true);
    const result = await withToast(saveCor(cor?.id ?? null, { nome, hex }));
    setPending(false);
    if (result.ok) {
      onSaved(result.data);
      onOpenChange(false);
    } else {
      setErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={cor ? 'Editar cor' : 'Nova cor'}
        description="O nome aparece para o cliente; a bolinha mostra a cor aproximada."
        className="max-w-md"
      >
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Nome da cor" htmlFor="cor-nome" error={errors.nome}>
            <Input
              id="cor-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Terracota"
              maxLength={40}
              aria-invalid={Boolean(errors.nome)}
              autoFocus
            />
          </Field>
          <div>
            <p className="text-ink mb-1.5 text-sm font-semibold">Cor</p>
            <div className="flex items-center gap-3">
              <label className="border-ink/25 shadow-soft relative block size-14 shrink-0 cursor-pointer overflow-hidden rounded-full border">
                <span className="sr-only">Escolher a cor</span>
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{ backgroundColor: validHex ? hex : '#CCCCCC' }}
                />
                <input
                  type="color"
                  value={validHex ? hex.toLowerCase() : '#cccccc'}
                  onChange={(e) => setHex(e.target.value.toUpperCase())}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </label>
              <div className="flex-1">
                <label htmlFor="cor-hex" className="sr-only">
                  Código da cor (hexadecimal)
                </label>
                <Input
                  id="cor-hex"
                  value={hex}
                  onChange={(e) => {
                    let v = e.target.value.trim().toUpperCase();
                    if (v && !v.startsWith('#')) v = `#${v}`;
                    setHex(v.slice(0, 7));
                  }}
                  spellCheck={false}
                  aria-invalid={Boolean(errors.hex) || !validHex}
                  className="font-mono"
                />
              </div>
            </div>
            <p className="text-muted mt-1.5 text-sm">
              Toque na bolinha para escolher. O código (ex.: #A07260) é opcional.
            </p>
            {errors.hex || !validHex ? (
              <p role="alert" className="text-danger mt-1 text-sm font-medium">
                {errors.hex ?? 'Informe a cor no formato #RRGGBB.'}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" variant="green" disabled={pending || !validHex}>
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {cor ? 'Salvar cor' : 'Criar cor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
