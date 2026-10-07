'use server';
import { requireAdminAction } from '@/lib/admin/auth';
import { GENERIC_ERROR, type ActionResult } from '@/lib/admin/result';
import { revalidateSite } from '@/lib/admin/revalidate';
import { isUuid, run, uuidList } from '@/lib/admin/run';
import type { Cor } from '@/lib/types';
import { corSchema, fieldErrorsFrom } from '@/lib/validation/admin';

export async function saveCor(id: string | null, raw: unknown): Promise<ActionResult<Cor>> {
  return run('cor.salvar', async () => {
    const { supabase } = await requireAdminAction();
    if (id !== null && !isUuid(id)) return { ok: false, error: GENERIC_ERROR };
    const parsed = corSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Confira os campos destacados.',
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }
    const values = { nome: parsed.data.nome, hex: parsed.data.hex.toUpperCase() };
    const duplicate = {
      ok: false as const,
      error: 'Confira os campos destacados.',
      fieldErrors: { nome: 'Já existe uma cor com este nome.' },
    };

    if (id) {
      const { data, error } = await supabase
        .from('cores')
        .update(values)
        .eq('id', id)
        .select('id, nome, hex, ordem')
        .single();
      if (error) {
        if (error.code === '23505') return duplicate;
        throw new Error(error.message);
      }
      revalidateSite('products');
      return { ok: true, data, message: 'Cor salva com sucesso.' };
    }

    const { data: last } = await supabase
      .from('cores')
      .select('ordem')
      .order('ordem', { ascending: false })
      .limit(1);
    const { data, error } = await supabase
      .from('cores')
      .insert({ ...values, ordem: (last?.[0]?.ordem ?? 0) + 1 })
      .select('id, nome, hex, ordem')
      .single();
    if (error) {
      if (error.code === '23505') return duplicate;
      throw new Error(error.message);
    }
    revalidateSite('products');
    return { ok: true, data, message: 'Cor criada com sucesso.' };
  });
}

export async function deleteCor(id: unknown): Promise<ActionResult> {
  return run('cor.excluir', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id)) return { ok: false, error: GENERIC_ERROR };
    const { count } = await supabase
      .from('produto_cores')
      .select('produto_id', { count: 'exact', head: true })
      .eq('cor_id', id);
    if ((count ?? 0) > 0) {
      return {
        ok: false,
        error: `Esta cor está em uso por ${count} ${count === 1 ? 'produto' : 'produtos'}. Remova a cor desses produtos antes de excluir.`,
      };
    }
    const { error } = await supabase.from('cores').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        return {
          ok: false,
          error: 'Esta cor está em uso por algum produto e não pode ser excluída.',
        };
      }
      throw new Error(error.message);
    }
    revalidateSite('products');
    return { ok: true, data: undefined, message: 'Cor excluída.' };
  });
}

export async function reorderCores(ids: unknown): Promise<ActionResult> {
  return run('cor.ordenar', async () => {
    const { supabase } = await requireAdminAction();
    const list = uuidList(ids);
    if (!list) return { ok: false, error: GENERIC_ERROR };
    const results = await Promise.all(
      list.map((id, i) =>
        supabase
          .from('cores')
          .update({ ordem: i + 1 })
          .eq('id', id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);
    revalidateSite('products');
    return { ok: true, data: undefined, message: 'Ordem atualizada.' };
  });
}
