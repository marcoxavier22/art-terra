'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ExternalLink, FileText, FileUp, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader, ProgressBar } from '@/components/admin/image-uploader';
import { Card } from '@/components/admin/page-title';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/form';
import { MAX_PDF_BYTES, UploadError, discardUpload, uploadFile } from '@/lib/admin/upload';
import { withToast } from '@/lib/admin/use-action';
import { maskPhoneBR } from '@/lib/text';
import { configuracoesSchema, type ConfiguracoesInput } from '@/lib/validation/admin';
import { saveConfiguracoes } from './actions';

export function SettingsForm({ initial }: { initial: ConfiguracoesInput }) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ConfiguracoesInput>({
    resolver: zodResolver(configuracoesSchema),
    defaultValues: initial,
  });
  const [saving, setSaving] = React.useState(false);
  const [pdfProgress, setPdfProgress] = React.useState<number | null>(null);
  const pdfRef = React.useRef<HTMLInputElement>(null);
  const pdfUrl = watch('catalogo_pdf_url');

  React.useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const dropIfUnsaved = (url: string | null, saved: string | null) => {
    if (url && url !== saved) void discardUpload(url);
  };

  async function uploadPdf(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Envie um arquivo PDF.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error('O PDF precisa ter no máximo 25 MB.');
      return;
    }
    setPdfProgress(1);
    try {
      const url = await uploadFile({
        bucket: 'documentos',
        folder: 'catalogo',
        baseName: 'catalogo-art-terra',
        blob: file,
        onProgress: setPdfProgress,
      });
      dropIfUnsaved(pdfUrl, initial.catalogo_pdf_url);
      setValue('catalogo_pdf_url', url, { shouldDirty: true });
      toast.success('PDF enviado. Toque em Salvar para publicar.');
    } catch (error) {
      toast.error(error instanceof UploadError ? error.message : 'Não foi possível enviar o PDF.');
    } finally {
      setPdfProgress(null);
    }
  }

  async function onSubmit(values: ConfiguracoesInput) {
    setSaving(true);
    const result = await withToast(saveConfiguracoes(values));
    setSaving(false);
    if (result.ok) {
      reset(values);
      router.refresh();
    } else {
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(field as keyof ConfiguracoesInput, { message });
      }
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, () =>
        toast.error('Confira os campos destacados em vermelho.'),
      )}
      className="space-y-5"
    >
      <Card
        title="Dados da empresa"
        description="Aparecem no rodapé, na página de contato e nos botões de WhatsApp."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Nome da empresa"
            htmlFor="nome_empresa"
            error={errors.nome_empresa?.message}
          >
            <Input id="nome_empresa" maxLength={80} {...register('nome_empresa')} />
          </Field>
          <Field label="Slogan" htmlFor="slogan" optional error={errors.slogan?.message}>
            <Input id="slogan" maxLength={120} {...register('slogan')} />
          </Field>
          <Field
            label="WhatsApp de atendimento"
            htmlFor="whatsapp"
            error={errors.whatsapp?.message}
            hint="Com DDD. É para este número que vão todos os botões de WhatsApp do site."
          >
            <Input
              id="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(24) 99201-1676"
              aria-invalid={Boolean(errors.whatsapp)}
              {...register('whatsapp', {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  setValue('whatsapp', maskPhoneBR(e.target.value)),
              })}
            />
          </Field>
          <Field label="E-mail" htmlFor="email" optional error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              maxLength={160}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>
          <Field
            label="Instagram"
            htmlFor="instagram"
            optional
            error={errors.instagram?.message}
            hint="Só o nome do perfil, sem o link. Ex.: artterraoficial"
          >
            <Input
              id="instagram"
              maxLength={60}
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(errors.instagram)}
              {...register('instagram')}
            />
          </Field>
          <Field
            label="Horário de atendimento"
            htmlFor="horario_atendimento"
            optional
            error={errors.horario_atendimento?.message}
            hint="Se ficar em branco, o horário não aparece no site. Ex.: Seg. a sex., 7h às 17h"
          >
            <Input id="horario_atendimento" maxLength={240} {...register('horario_atendimento')} />
          </Field>
          <Field
            className="sm:col-span-2"
            label="Endereço"
            htmlFor="endereco"
            optional
            error={errors.endereco?.message}
          >
            <Input id="endereco" maxLength={240} {...register('endereco')} />
          </Field>
        </div>
      </Card>

      <Card
        title="Topo da página inicial"
        description="O título grande, o texto e a foto de fundo que abrem o site."
      >
        <div className="grid grid-cols-1 gap-4">
          <Field
            label="Título"
            htmlFor="hero_titulo"
            optional
            error={errors.hero_titulo?.message}
            hint="Em branco, usa “Elegância atemporal em concreto”."
          >
            <Input id="hero_titulo" maxLength={90} {...register('hero_titulo')} />
          </Field>
          <Field
            label="Texto abaixo do título"
            htmlFor="hero_subtitulo"
            optional
            error={errors.hero_subtitulo?.message}
          >
            <Textarea
              id="hero_subtitulo"
              rows={3}
              maxLength={320}
              {...register('hero_subtitulo')}
            />
          </Field>
          <div className="max-w-md">
            <Controller
              control={control}
              name="hero_imagem_url"
              render={({ field }) => (
                <ImageUploader
                  id="hero_imagem"
                  label="Foto de fundo (opcional)"
                  hint="Foto larga (deitada), de uma obra. Sem foto aqui, o site usa a fachada de cobogós padrão."
                  value={field.value}
                  onChange={(url) => {
                    dropIfUnsaved(field.value, initial.hero_imagem_url);
                    field.onChange(url);
                  }}
                  folder="site"
                  baseName="hero"
                  aspect="aspect-[16/9]"
                />
              )}
            />
          </div>
        </div>
      </Card>

      <Card
        title="Catálogo em PDF"
        description="Com um PDF aqui, aparece o botão “Baixar catálogo em PDF” na página do catálogo. Máximo de 25 MB."
      >
        {pdfUrl ? (
          <div className="border-line bg-offwhite flex flex-wrap items-center gap-3 rounded-[10px] border p-3.5">
            <FileText className="text-brand-orange-ink size-8 shrink-0" aria-hidden />
            <p className="text-ink min-w-0 flex-1 font-semibold">
              PDF{' '}
              {pdfUrl === initial.catalogo_pdf_url
                ? 'publicado no site'
                : 'enviado (salve para publicar)'}
            </p>
            <Button asChild variant="outline" size="sm">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Abrir
              </a>
            </Button>
            <Button
              variant="dangerOutline"
              size="sm"
              onClick={() => {
                dropIfUnsaved(pdfUrl, initial.catalogo_pdf_url);
                setValue('catalogo_pdf_url', null, { shouldDirty: true });
              }}
            >
              <Trash2 />
              Remover
            </Button>
          </div>
        ) : (
          <p className="text-muted text-sm">
            Nenhum PDF enviado. O botão de download está escondido no site.
          </p>
        )}
        {pdfProgress !== null ? (
          <div className="mt-3 max-w-sm space-y-1.5">
            <ProgressBar value={pdfProgress} label="Enviando PDF" />
            <p className="text-sm font-semibold">Enviando… {pdfProgress}%</p>
          </div>
        ) : (
          <Button variant="outline" className="mt-3" onClick={() => pdfRef.current?.click()}>
            <FileUp />
            {pdfUrl ? 'Trocar PDF' : 'Enviar PDF'}
          </Button>
        )}
        <input
          ref={pdfRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            void uploadPdf(e.target.files);
            e.target.value = '';
          }}
        />
      </Card>

      <div className="border-line sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 border-t bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0 lg:-mx-8 lg:px-8">
        <Button
          type="submit"
          variant="green"
          disabled={saving || pdfProgress !== null}
          className="w-full sm:w-auto"
        >
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Salvar configurações
        </Button>
      </div>
    </form>
  );
}
