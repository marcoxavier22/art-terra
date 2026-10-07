'use server';
import { requireAdminAction } from '@/lib/admin/auth';
import { GENERIC_ERROR, type ActionResult } from '@/lib/admin/result';
import { revalidateSite } from '@/lib/admin/revalidate';
import { isUuid, run, uuidList } from '@/lib/admin/run';
import { isAllowedImageUrl, removeStorageFiles } from '@/lib/admin/storage';
import { categoriaSchema, fieldErrorsFrom } from '@/lib/validation/admin';

export async function saveCategoria(id: string | null, raw: unknown): Promise<ActionResult> {
  return run('categoria.salvar', async () => {
    const { supabase } = await requireAdminAction();
    if (id !== null && !isUuid(id)) return { ok: false, error: GENERIC_ERROR };
    const parsed = categoriaSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Confira os campos destacados.',
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }
    const input = parsed.data;
    if (input.imagem_capa_url && !isAllowedImageUrl(input.imagem_capa_url)) {
      return { ok: false, error: 'A imagem de capa não é válida. Envie a foto novamente.' };
    }
    const values = {
      nome: input.nome,
      slug: input.slug,
      descricao: input.descricao || null,
      imagem_capa_url: input.imagem_capa_url,
      ativo: input.ativo,
    };
    const slugTaken = {
      ok: false as const,
      error: 'Confira os campos destacados.',
      fieldErrors: { slug: 'Já existe uma categoria com este endereço. Escolha outro.' },
    };

    if (id) {
      const { data: before } = await supabase
        .from('categorias')
        .select('imagem_capa_url')
        .eq('id', id)
        .maybeSingle();
      if (!before) return { ok: false, error: 'Esta categoria não existe mais.' };
      const { error } = await supabase.from('categorias').update(values).eq('id', id);
      if (error) {
        if (error.code === '23505') return slugTaken;
        throw new Error(error.message);
      }
      if (before.imagem_capa_url && before.imagem_capa_url !== input.imagem_capa_url) {
        await removeStorageFiles(supabase, [before.imagem_capa_url]);
      }
    } else {
      const { data: last } = await supabase
        .from('categorias')
        .select('ordem')
        .order('ordem', { ascending: false })
        .limit(1);
      const { error } = await supabase
        .from('categorias')
        .insert({ ...values, ordem: (last?.[0]?.ordem ?? 0) + 1 });
      if (error) {
        if (error.code === '23505') return slugTaken;
        throw new Error(error.message);
      }
    }
    revalidateSite('categories', 'products');
    return { ok: true, data: undefined, message: 'Categoria salva com sucesso.' };
  });
}

export async function setCategoriaAtivo(id: unknown, ativo: boolean): Promise<ActionResult> {
  return run('categoria.ativo', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id) || typeof ativo !== 'boolean') return { ok: false, error: GENERIC_ERROR };
    const { error } = await supabase.from('categorias').update({ ativo }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidateSite('categories', 'products');
    return {
      ok: true,
      data: undefined,
      message: ativo
        ? 'Categoria ativada. Já aparece no site.'
        : 'Categoria desativada. Ela e seus produtos não aparecem mais no site.',
    };
  });
}

export async function deleteCategoria(id: unknown): Promise<ActionResult> {
  return run('categoria.excluir', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id)) return { ok: false, error: GENERIC_ERROR };
    const { count } = await supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .eq('categoria_id', id);
    if ((count ?? 0) > 0) {
      return {
        ok: false,
        error: `Esta categoria tem ${count} ${count === 1 ? 'produto' : 'produtos'}. Mova-os para outra categoria ou exclua-os antes. Se quiser só esconder do site, desative a categoria.`,
      };
    }
    const { data: before } = await supabase
      .from('categorias')
      .select('imagem_capa_url')
      .eq('id', id)
      .maybeSingle();
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        return { ok: false, error: 'Esta categoria ainda tem produtos e não pode ser excluída.' };
      }
      throw new Error(error.message);
    }
    await removeStorageFiles(supabase, [before?.imagem_capa_url]);
    revalidateSite('categories', 'products');
    return { ok: true, data: undefined, message: 'Categoria excluída.' };
  });
}

export async function reorderCategorias(ids: unknown): Promise<ActionResult> {
  return run('categoria.ordenar', async () => {
    const { supabase } = await requireAdminAction();
    const list = uuidList(ids);
    if (!list) return { ok: false, error: GENERIC_ERROR };
    const results = await Promise.all(
      list.map((id, i) =>
        supabase
          .from('categorias')
          .update({ ordem: i + 1 })
          .eq('id', id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);
    revalidateSite('categories', 'products');
    return { ok: true, data: undefined, message: 'Ordem atualizada.' };
  });
}
