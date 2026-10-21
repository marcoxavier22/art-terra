'use server';
import { requireAdminAction } from '@/lib/admin/auth';
import { type ActionResult } from '@/lib/admin/result';
import { revalidateSite } from '@/lib/admin/revalidate';
import { run } from '@/lib/admin/run';
import { isAllowedDocumentUrl, isAllowedImageUrl, removeStorageFiles } from '@/lib/admin/storage';
import { toWhatsappDigits } from '@/lib/text';
import { configuracoesSchema, fieldErrorsFrom } from '@/lib/validation/admin';

export async function saveConfiguracoes(raw: unknown): Promise<ActionResult> {
  return run('config.salvar', async () => {
    const { supabase } = await requireAdminAction();
    const parsed = configuracoesSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Confira os campos destacados.',
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }
    const input = parsed.data;
    const whatsapp = toWhatsappDigits(input.whatsapp);
    if (!whatsapp) {
      return {
        ok: false,
        error: 'Confira os campos destacados.',
        fieldErrors: { whatsapp: 'Informe o WhatsApp com DDD, ex.: (24) 99201-1676.' },
      };
    }
    if (input.hero_imagem_url && !isAllowedImageUrl(input.hero_imagem_url)) {
      return { ok: false, error: 'A imagem do topo não é válida. Envie novamente.' };
    }
    if (input.catalogo_pdf_url && !isAllowedDocumentUrl(input.catalogo_pdf_url)) {
      return { ok: false, error: 'O PDF não é válido. Envie o arquivo novamente.' };
    }

    const { data: before } = await supabase
      .from('configuracoes')
      .select('hero_imagem_url, catalogo_pdf_url')
      .eq('id', 1)
      .single();

    const { error } = await supabase
      .from('configuracoes')
      .update({
        nome_empresa: input.nome_empresa,
        slogan: input.slogan || null,
        whatsapp, // digits only, with country code 55
        email: input.email || null,
        instagram: input.instagram.replace(/^@/, '') || null,
        endereco: input.endereco || null,
        horario_atendimento: input.horario_atendimento || null,
        hero_titulo: input.hero_titulo || null,
        hero_subtitulo: input.hero_subtitulo || null,
        hero_imagem_url: input.hero_imagem_url,
        catalogo_pdf_url: input.catalogo_pdf_url,
      })
      .eq('id', 1);
    if (error) throw new Error(error.message);

    await removeStorageFiles(supabase, [
      before?.hero_imagem_url !== input.hero_imagem_url ? before?.hero_imagem_url : null,
      before?.catalogo_pdf_url !== input.catalogo_pdf_url ? before?.catalogo_pdf_url : null,
    ]);

    revalidateSite('settings');
    return {
      ok: true,
      data: undefined,
      message: 'Configurações salvas. O site já foi atualizado.',
    };
  });
}
