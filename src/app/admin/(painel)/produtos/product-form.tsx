'use client';
import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Check, ExternalLink, EyeOff, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ColorDialog } from '@/components/admin/color-dialog';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  IMAGE_ACCEPT,
  ImageUploader,
  ProgressBar,
  useImageUpload,
} from '@/components/admin/image-uploader';
import { Card, PageTitle } from '@/components/admin/page-title';
import { SortableList } from '@/components/admin/sortable-list';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { discardUpload } from '@/lib/admin/upload';
import { withToast } from '@/lib/admin/use-action';
import { BLUR_DATA_URL } from '@/lib/site';
import { slugify } from '@/lib/text';
import type { Cor } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  FACE_OPTIONS,
  MAX_EXTRA_IMAGES,
  produtoSchema,
  type ProdutoInput,
} from '@/lib/validation/admin';
import { deleteProdutos, saveProduto, setProdutosAtivo } from './actions';
import type { FormCategoria } from './load';

type AfterSave = 'list' | 'another';

export function ProductForm({
  id,
  initial,
  categorias,
  cores: initialCores,
}: {
  id: string | null;
  initial: ProdutoInput;
  categorias: FormCategoria[];
  cores: Cor[];
}) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProdutoInput>({
    resolver: zodResolver(produtoSchema),
    defaultValues: initial,
  });
  const medidas = useFieldArray({ control, name: 'medidas' });

  const [cores, setCores] = React.useState(initialCores);
  const [colorDialog, setColorDialog] = React.useState(false);
  const [saving, setSaving] = React.useState<AfterSave | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [leaveTo, setLeaveTo] = React.useState<string | null>(null);
  const slugTouched = React.useRef(Boolean(id));
  const allowLeave = React.useRef(false);

  const nome = watch('nome');
  const slug = watch('slug');
  const categoriaId = watch('categoria_id');
  const face = watch('face');
  const selectedCores = watch('cores');
  const extras = watch('imagens_extras');
  const categoria = categorias.find((c) => c.id === categoriaId);
  const baseName = slug || slugify(nome) || 'produto';

  /* ---------------- unsaved-changes guard ---------------- */
  const dirtyRef = React.useRef(false);
  dirtyRef.current = isDirty;

  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current && !allowLeave.current) e.preventDefault();
    };
    // In-app links (sidebar, bottom menu) are intercepted so nothing is lost by accident.
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || allowLeave.current) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href]',
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank') return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname)
        return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveTo(url.pathname + url.search);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  function leave(href: string) {
    allowLeave.current = true;
    router.push(href);
  }

  /* ---------------- images ---------------- */
  const savedImages = React.useMemo(
    () =>
      new Set(
        [
          initial.imagem_principal_url,
          initial.imagem_aplicacao_url,
          ...initial.imagens_extras,
        ].filter(Boolean),
      ),
    [initial],
  );
  /** A file uploaded in this session and dropped before saving would be an orphan: remove it now. */
  const dropIfUnsaved = (url: string | null) => {
    if (url && !savedImages.has(url)) void discardUpload(url);
  };

  const extrasUpload = useImageUpload('produtos', `${baseName}-extra`);
  const extrasInput = React.useRef<HTMLInputElement>(null);
  async function addExtras(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_EXTRA_IMAGES - getValues('imagens_extras').length;
    if (room <= 0) return;
    const list = Array.from(files);
    if (list.length > room) {
      toast.info(
        `Só cabem mais ${room} ${room === 1 ? 'foto' : 'fotos'}. As demais foram ignoradas.`,
      );
    }
    const urls = await extrasUpload.upload(list.slice(0, room));
    if (urls.length) {
      setValue('imagens_extras', [...getValues('imagens_extras'), ...urls], { shouldDirty: true });
    }
  }

  /* ---------------- colours ---------------- */
  function toggleCor(corId: string) {
    const current = getValues('cores');
    setValue(
      'cores',
      current.includes(corId) ? current.filter((c) => c !== corId) : [...current, corId],
      { shouldDirty: true },
    );
  }
  const chosen = selectedCores
    .map((corId) => cores.find((c) => c.id === corId))
    .filter((c): c is Cor => Boolean(c));

  /* ---------------- submit ---------------- */
  async function submit(values: ProdutoInput, after: AfterSave) {
    setSaving(after);
    const result = await withToast(saveProduto(id, values));
    if (!result.ok) {
      setSaving(null);
      const entries = Object.entries(result.fieldErrors ?? {});
      for (const [field, message] of entries) {
        setError(field as keyof ProdutoInput, { message });
      }
      if (entries[0]) setFocus(entries[0][0] as keyof ProdutoInput);
      return;
    }
    allowLeave.current = true;
    if (after === 'another') {
      router.push(`/admin/produtos/novo?categoria=${values.categoria_id}&k=${Date.now()}`);
    } else {
      router.push(`/admin/produtos?categoria=${values.categoria_id}`);
    }
    router.refresh();
  }

  const onInvalid = () => toast.error('Confira os campos destacados em vermelho.');
  const save = (after: AfterSave) => handleSubmit((values) => submit(values, after), onInvalid)();

  async function removeProduct() {
    if (!id) return;
    setDeleting(true);
    const result = await withToast(deleteProdutos([id]));
    setDeleting(false);
    if (result.ok) {
      allowLeave.current = true;
      router.push('/admin/produtos');
      router.refresh();
    }
  }

  async function deactivateInstead() {
    if (!id) return;
    setDeleting(true);
    const result = await withToast(setProdutosAtivo([id], false));
    setDeleting(false);
    if (result.ok) {
      allowLeave.current = true;
      router.push('/admin/produtos');
      router.refresh();
    }
  }

  const busy = saving !== null || deleting;
  const canPreview = Boolean(id) && initial.ativo && categoria?.ativo;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void save('list');
      }}
    >
      <PageTitle
        title={id ? 'Editar produto' : 'Novo produto'}
        description={
          id
            ? 'Altere o que precisar e toque em Salvar. O site é atualizado em segundos.'
            : 'Preencha os dados abaixo. Só o nome e a categoria são obrigatórios.'
        }
      >
        {canPreview ? (
          <Button asChild variant="outline">
            <a
              href={`/catalogo/${categoria!.slug}/${initial.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink />
              Ver no site
            </a>
          </Button>
        ) : null}
      </PageTitle>

      <div className="space-y-5">
        {/* 1. Básico */}
        <Card title="1. Básico">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoria" htmlFor="categoria_id" error={errors.categoria_id?.message}>
              <Select
                id="categoria_id"
                aria-invalid={Boolean(errors.categoria_id)}
                {...register('categoria_id')}
              >
                <option value="">Escolha…</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                    {c.ativo ? '' : ' (desativada)'}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nome do produto" htmlFor="nome" error={errors.nome?.message}>
              <Input
                id="nome"
                placeholder="Ex.: Cobogó Círculo"
                maxLength={120}
                aria-invalid={Boolean(errors.nome)}
                {...register('nome', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!slugTouched.current) {
                      setValue('slug', slugify(e.target.value), { shouldValidate: false });
                    }
                  },
                })}
              />
            </Field>
            <Field
              className="sm:col-span-2"
              label="Endereço da página (slug)"
              htmlFor="slug"
              error={errors.slug?.message}
              hint={`É o final do link do produto: /catalogo/${categoria?.slug ?? 'categoria'}/${slug || 'nome-do-produto'}. Criado sozinho a partir do nome.`}
            >
              <Input
                id="slug"
                spellCheck={false}
                autoCapitalize="none"
                maxLength={80}
                aria-invalid={Boolean(errors.slug)}
                className="font-mono text-[0.95rem]"
                {...register('slug', {
                  onChange: () => {
                    slugTouched.current = true;
                  },
                  onBlur: (e: React.FocusEvent<HTMLInputElement>) =>
                    setValue('slug', slugify(e.target.value), { shouldDirty: true }),
                })}
              />
            </Field>
            <Field
              className="sm:col-span-2"
              label="Descrição"
              htmlFor="descricao"
              optional
              error={errors.descricao?.message}
              hint="Uma ou duas frases sobre o produto e onde ele é usado."
            >
              <Textarea id="descricao" rows={3} maxLength={2000} {...register('descricao')} />
            </Field>
          </div>
        </Card>

        {/* 2. Medidas */}
        <Card
          title="2. Medidas"
          description="Uma linha para cada medida. O rótulo é opcional (ex.: “Peça reta”)."
        >
          {medidas.fields.length === 0 ? (
            <p className="bg-sand text-muted rounded-[10px] px-3.5 py-3 text-sm">
              Nenhuma medida cadastrada. Recomendamos informar pelo menos uma.
            </p>
          ) : (
            <SortableList
              items={medidas.fields}
              getId={(f) => f.id}
              getLabel={() => 'medida'}
              onReorder={(ordered) => {
                const values = getValues('medidas');
                const byId = new Map(medidas.fields.map((f, i) => [f.id, values[i]]));
                medidas.replace(ordered.map((f) => byId.get(f.id)!));
              }}
              className="space-y-2.5"
              renderItem={(field, { handle }, index) => (
                <div className="border-line bg-offwhite flex items-start gap-1.5 rounded-[10px] border p-2">
                  <div className="pt-1.5">{handle}</div>
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_1.4fr]">
                    <div>
                      <label htmlFor={`medidas.${index}.rotulo`} className="sr-only">
                        Rótulo da medida {index + 1} (opcional)
                      </label>
                      <Input
                        id={`medidas.${index}.rotulo`}
                        placeholder="Rótulo (opcional)"
                        maxLength={40}
                        aria-invalid={Boolean(errors.medidas?.[index]?.rotulo)}
                        {...register(`medidas.${index}.rotulo`)}
                      />
                    </div>
                    <div>
                      <label htmlFor={`medidas.${index}.valor`} className="sr-only">
                        Valor da medida {index + 1}
                      </label>
                      <Input
                        id={`medidas.${index}.valor`}
                        placeholder="Ex.: 39x39x07"
                        maxLength={60}
                        aria-invalid={Boolean(errors.medidas?.[index]?.valor)}
                        {...register(`medidas.${index}.valor`)}
                      />
                      {errors.medidas?.[index]?.valor ? (
                        <p role="alert" className="text-danger mt-1 text-sm font-medium">
                          {errors.medidas[index]?.valor?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => medidas.remove(index)}
                    aria-label={`Remover medida ${index + 1}`}
                    className="text-danger hover:bg-danger/8 mt-0.5 grid size-11 shrink-0 place-items-center rounded-lg"
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                </div>
              )}
            />
          )}
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => medidas.append({ rotulo: '', valor: '' })}
            disabled={medidas.fields.length >= 30}
          >
            <Plus />
            Adicionar medida
          </Button>
        </Card>

        {/* 3. Especificações */}
        <Card
          title="3. Especificações"
          description="Preencha só o que fizer sentido para o produto."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Rendimento"
              htmlFor="rendimento"
              optional
              error={errors.rendimento?.message}
              hint="Texto que aparece no site. Ex.: 07 pç/m²"
            >
              <Input id="rendimento" maxLength={80} {...register('rendimento')} />
            </Field>
            <Field
              label="Peças por m² (para a calculadora)"
              htmlFor="rendimento_pecas_m2"
              optional
              error={errors.rendimento_pecas_m2?.message}
              hint="Só o número. Com ele, o site mostra uma calculadora de quantidade. Ex.: 7"
            >
              <Input
                id="rendimento_pecas_m2"
                inputMode="decimal"
                maxLength={7}
                aria-invalid={Boolean(errors.rendimento_pecas_m2)}
                {...register('rendimento_pecas_m2')}
              />
            </Field>
            <Field label="Face" htmlFor="face" error={errors.face?.message}>
              <Select id="face" {...register('face')}>
                {FACE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Observação da face"
              htmlFor="observacao_face"
              optional
              error={errors.observacao_face?.message}
              hint="Ex.: com ou sem floreira"
            >
              <Input
                id="observacao_face"
                maxLength={120}
                disabled={!face}
                {...register('observacao_face')}
              />
            </Field>
            <Field
              className="sm:col-span-2"
              label="Aplicação recomendada"
              htmlFor="aplicacao"
              optional
              error={errors.aplicacao?.message}
              hint="Ex.: Áreas externas, calçadas e garagens"
            >
              <Input id="aplicacao" maxLength={300} {...register('aplicacao')} />
            </Field>
            <Field
              className="sm:col-span-2"
              label="Observações"
              htmlFor="observacoes"
              optional
              error={errors.observacoes?.message}
            >
              <Textarea id="observacoes" rows={2} maxLength={1000} {...register('observacoes')} />
            </Field>
          </div>
        </Card>

        {/* 4. Cores */}
        <Card
          title="4. Cores e acabamentos"
          description="Toque nas cores em que o produto é fabricado. Sem nenhuma cor, o site mostra “Cor natural do concreto; outras sob consulta”."
        >
          <ul className="flex flex-wrap gap-2">
            {cores.map((cor) => {
              const on = selectedCores.includes(cor.id);
              return (
                <li key={cor.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleCor(cor.id)}
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-full border-2 py-1 pr-3.5 pl-1.5 text-sm font-semibold transition-colors',
                      on
                        ? 'border-brand-green bg-brand-green/8 text-brand-green'
                        : 'border-line text-ink hover:border-brand-green/40 bg-white',
                    )}
                  >
                    <span
                      aria-hidden
                      className="border-ink/25 grid size-7 place-items-center rounded-full border"
                      style={{ backgroundColor: cor.hex }}
                    >
                      {on ? (
                        <Check className="text-brand-green size-4 rounded-full bg-white/85 p-0.5" />
                      ) : null}
                    </span>
                    {cor.nome}
                  </button>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => setColorDialog(true)}
                className="border-brand-orange text-brand-orange-ink hover:bg-brand-orange/10 flex min-h-11 items-center gap-1.5 rounded-full border-2 border-dashed px-3.5 text-sm font-semibold"
              >
                <Plus className="size-4" aria-hidden />
                Nova cor
              </button>
            </li>
          </ul>

          {chosen.length > 1 ? (
            <div className="mt-5">
              <p className="text-ink mb-2 text-sm font-semibold">Ordem em que as cores aparecem</p>
              <SortableList
                items={chosen}
                getId={(c) => c.id}
                getLabel={(c) => c.nome}
                onReorder={(ordered) =>
                  setValue(
                    'cores',
                    ordered.map((c) => c.id),
                    { shouldDirty: true },
                  )
                }
                className="border-line max-w-sm overflow-hidden rounded-[10px] border bg-white"
                itemClassName="border-b border-line bg-white last:border-b-0"
                renderItem={(cor, { handle }) => (
                  <div className="flex items-center gap-2 px-1.5 py-1">
                    {handle}
                    <span
                      aria-hidden
                      className="border-ink/25 size-6 rounded-full border"
                      style={{ backgroundColor: cor.hex }}
                    />
                    <span className="text-sm font-medium">{cor.nome}</span>
                  </div>
                )}
              />
            </div>
          ) : null}
        </Card>

        {/* 5. Imagens */}
        <Card
          title="5. Imagens"
          description="As fotos são reduzidas automaticamente antes do envio, então pode usar a foto direto do celular."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Controller
              control={control}
              name="imagem_principal_url"
              render={({ field }) => (
                <ImageUploader
                  id="imagem_principal"
                  label="Foto principal"
                  hint="A peça sozinha, de preferência com fundo limpo."
                  value={field.value}
                  onChange={(url) => {
                    dropIfUnsaved(field.value);
                    field.onChange(url);
                  }}
                  folder="produtos"
                  baseName={baseName}
                />
              )}
            />
            <Controller
              control={control}
              name="imagem_aplicacao_url"
              render={({ field }) => (
                <ImageUploader
                  id="imagem_aplicacao"
                  label="Foto de aplicação (opcional)"
                  hint="O produto instalado em uma obra. Aparece ao passar o mouse no catálogo."
                  value={field.value}
                  onChange={(url) => {
                    dropIfUnsaved(field.value);
                    field.onChange(url);
                  }}
                  folder="produtos"
                  baseName={`${baseName}-aplicacao`}
                />
              )}
            />
          </div>

          <div className="mt-6">
            <p className="text-ink mb-1.5 text-sm font-semibold">
              Fotos extras ({extras.length}/{MAX_EXTRA_IMAGES})
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {extras.map((url, index) => (
                <li
                  key={url}
                  className="border-line bg-sand relative aspect-[4/3] overflow-hidden rounded-[10px] border"
                >
                  <Image
                    src={url}
                    alt={`Foto extra ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 200px, 45vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      dropIfUnsaved(url);
                      setValue(
                        'imagens_extras',
                        getValues('imagens_extras').filter((u) => u !== url),
                        { shouldDirty: true },
                      );
                    }}
                    aria-label={`Remover foto extra ${index + 1}`}
                    className="text-danger shadow-soft absolute top-1 right-1 grid size-11 place-items-center rounded-full bg-white/90 hover:bg-white"
                  >
                    <X className="size-5" aria-hidden />
                  </button>
                </li>
              ))}
              {extras.length < MAX_EXTRA_IMAGES ? (
                <li>
                  <button
                    type="button"
                    onClick={() => extrasInput.current?.click()}
                    disabled={extrasUpload.progress !== null}
                    className="border-line bg-sand/60 text-muted hover:border-brand-green hover:text-brand-green flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-[10px] border-2 border-dashed p-3 text-sm font-semibold disabled:opacity-60"
                  >
                    {extrasUpload.progress !== null ? (
                      <>
                        <Loader2 className="size-6 animate-spin" aria-hidden />
                        <ProgressBar value={extrasUpload.progress} label="Enviando fotos extras" />
                        Enviando… {extrasUpload.progress}%
                      </>
                    ) : (
                      <>
                        <ImagePlus className="size-7" aria-hidden />
                        Adicionar fotos
                      </>
                    )}
                  </button>
                </li>
              ) : null}
            </ul>
            <input
              ref={extrasInput}
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                void addExtras(e.target.files);
                e.target.value = '';
              }}
            />
          </div>
        </Card>

        {/* 6. Publicação */}
        <Card title="6. Publicação">
          <div className="space-y-4">
            <Controller
              control={control}
              name="ativo"
              render={({ field }) => (
                <label className="flex items-start gap-3.5">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="text-ink block font-semibold">
                      {field.value ? 'Ativo: aparece no site' : 'Desativado: escondido do site'}
                    </span>
                    <span className="text-muted text-sm">
                      Desative quando o produto estiver fora de linha. Ele continua guardado aqui.
                    </span>
                  </span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="destaque"
              render={({ field }) => (
                <label className="flex items-start gap-3.5">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="text-ink block font-semibold">Destaque na página inicial</span>
                    <span className="text-muted text-sm">
                      O ideal é manter de 3 a 6 produtos em destaque.
                    </span>
                  </span>
                </label>
              )}
            />
          </div>
        </Card>

        {id ? (
          <Card title="Excluir produto" className="border-danger/25">
            <p className="text-muted text-sm">
              Apaga o produto e as fotos dele para sempre. Se ele só saiu de linha, prefira
              desativar.
            </p>
            <Button
              variant="dangerOutline"
              className="mt-3"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 />
              Excluir este produto
            </Button>
          </Card>
        ) : null}
      </div>

      {/* fixed action bar */}
      <div className="border-line sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-6 border-t bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button type="submit" variant="green" disabled={busy} className="flex-1 sm:flex-none">
            {saving === 'list' ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Salvar
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void save('another')}
            className="flex-1 sm:flex-none"
          >
            {saving === 'another' ? <Loader2 className="animate-spin" aria-hidden /> : null}
            Salvar e adicionar outro
          </Button>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => (isDirty ? setLeaveTo('/admin/produtos') : leave('/admin/produtos'))}
            className="w-full sm:ml-auto sm:w-auto"
          >
            Cancelar
          </Button>
        </div>
      </div>

      <ColorDialog
        open={colorDialog}
        onOpenChange={setColorDialog}
        cor={null}
        onSaved={(cor) => {
          setCores((list) => [...list, cor]);
          setValue('cores', [...getValues('cores'), cor.id], { shouldDirty: true });
        }}
      />

      <ConfirmDialog
        open={leaveTo !== null}
        onOpenChange={(open) => !open && setLeaveTo(null)}
        title="Sair sem salvar?"
        description="Você fez alterações que ainda não foram salvas. Se sair agora, elas serão perdidas."
        confirmLabel="Sair sem salvar"
        onConfirm={() => leaveTo && leave(leaveTo)}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Excluir “${initial.nome}”?`}
        description="Esta ação não pode ser desfeita. As fotos do produto também serão apagadas."
        confirmLabel="Excluir definitivamente"
        pending={deleting}
        onConfirm={removeProduct}
      >
        {initial.ativo ? (
          <div className="border-brand-green/25 bg-brand-green/5 rounded-[10px] border p-3.5">
            <p className="text-ink text-sm">
              <strong>Sugestão:</strong> se o produto só saiu de linha por um tempo, desative em vez
              de excluir. Ele some do site, mas continua guardado aqui.
            </p>
            <Button
              variant="green"
              size="sm"
              className="mt-3"
              disabled={deleting}
              onClick={deactivateInstead}
            >
              <EyeOff />
              Desativar em vez de excluir
            </Button>
          </div>
        ) : null}
      </ConfirmDialog>
    </form>
  );
}
