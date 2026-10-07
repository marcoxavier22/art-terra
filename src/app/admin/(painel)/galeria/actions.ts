'use server';
import { z } from 'zod';
import { requireAdminAction } from '@/lib/admin/auth';
import { GENERIC_ERROR, type ActionResult } from '@/lib/admin/result';
import { revalidateSite } from '@/lib/admin/revalidate';
import { isUuid, run, uuidList } from '@/lib/admin/run';
import { isAllowedImageUrl, removeStorageFiles } from '@/lib/admin/storage';
import { fieldErrorsFrom, galeriaItemSchema } from '@/lib/validation/admin';

export async function addGaleriaItens(raw: unknown): Promise<ActionResult> {
  return run('galeria.adicionar', async () => {
    const { supabase } = await requireAdminAction();
    const parsed = z.array(galeriaItemSchema).min(1).max(30).safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Preencha a descrição de todas as fotos.',
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }
    if (parsed.data.some((i) => !isAllowedImageUrl(i.imagem_url))) {
      return { ok: false, error: 'Uma das fotos não é válida. Envie novamente.' };
    }
    const { data: last } = await supabase
      .from('galeria')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1);
    const start = (last?.[0]?.ordem ?? 0) + 1;
    const { error } = await supabase.from('galeria').insert(
      parsed.data.map((item, i) => ({
        imagem_url: item.imagem_url,
        legenda: item.legenda || null,
        alt: item.alt,
        ativo: item.ativo,
        ordem: start + i,
      })),
    );
    if (error) throw new Error(error.message);
    revalidateSite('gallery');
    return {
      ok: true,
      data: undefined,
      message:
        parsed.data.length > 1 ? 'Fotos adicionadas à galeria.' : 'Foto adicionada à galeria.',
    };
  });
}

export async function updateGaleriaItem(id: unknown, raw: unknown): Promise<ActionResult> {
  return run('galeria.salvar', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id)) return { ok: false, error: GENERIC_ERROR };
    const parsed = galeriaItemSchema.omit({ imagem_url: true }).safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Confira os campos destacados.',
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }
    const { error } = await supabase
      .from('galeria')
      .update({
        legenda: parsed.data.legenda || null,
        alt: parsed.data.alt,
        ativo: parsed.data.ativo,
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
    revalidateSite('gallery');
    return { ok: true, data: undefined, message: 'Foto salva com sucesso.' };
  });
}

export async function setGaleriaAtivo(id: unknown, ativo: boolean): Promise<ActionResult> {
  return run('galeria.ativo', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id) || typeof ativo !== 'boolean') return { ok: false, error: GENERIC_ERROR };
    const { error } = await supabase.from('galeria').update({ ativo }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidateSite('gallery');
    return {
      ok: true,
      data: undefined,
      message: ativo ? 'Foto visível no site.' : 'Foto escondida do site.',
    };
  });
}

export async function deleteGaleriaItem(id: unknown): Promise<ActionResult> {
  return run('galeria.excluir', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id)) return { ok: false, error: GENERIC_ERROR };
    const { data: before } = await supabase
      .from('galeria')
      .select('imagem_url')
      .eq('id', id)
      .maybeSingle();
    const { error } = await supabase.from('galeria').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await removeStorageFiles(supabase, [before?.imagem_url]);
    revalidateSite('gallery');
    return { ok: true, data: undefined, message: 'Foto excluída.' };
  });
}

export async function reorderGaleria(ids: unknown): Promise<ActionResult> {
  return run('galeria.ordenar', async () => {
    const { supabase } = await requireAdminAction();
    const list = uuidList(ids);
    if (!list) return { ok: false, error: GENERIC_ERROR };
    const results = await Promise.all(
      list.map((id, i) =>
        supabase
          .from('galeria')
          .update({ ordem: i + 1 })
          .eq('id', id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);
    revalidateSite('gallery');
    return { ok: true, data: undefined, message: 'Ordem atualizada.' };
  });
}
