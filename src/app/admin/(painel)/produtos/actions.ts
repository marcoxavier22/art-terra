'use server';
import { requireAdminAction } from '@/lib/admin/auth';
import { GENERIC_ERROR, type ActionResult } from '@/lib/admin/result';
import { revalidateSite } from '@/lib/admin/revalidate';
import { isUuid, run, uuidList } from '@/lib/admin/run';
import { isAllowedImageUrl, removeStorageFiles } from '@/lib/admin/storage';
import { parseStringArray } from '@/lib/data';
import { fieldErrorsFrom, produtoSchema } from '@/lib/validation/admin';

type Saved = { id: string; slug: string; categoriaSlug: string };

export async function saveProduto(id: string | null, raw: unknown): Promise<ActionResult<Saved>> {
  return run('produto.salvar', async () => {
    const { supabase } = await requireAdminAction();
    if (id !== null && !isUuid(id)) return { ok: false, error: GENERIC_ERROR };

    const parsed = produtoSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Confira os campos destacados.',
        fieldErrors: fieldErrorsFrom(parsed.error),
      };
    }
    const input = parsed.data;

    const images = [
      input.imagem_principal_url,
      input.imagem_aplicacao_url,
      ...input.imagens_extras,
    ];
    if (images.some((url) => url && !isAllowedImageUrl(url))) {
      return { ok: false, error: 'Uma das imagens não é válida. Envie a foto novamente.' };
    }

    const { data: categoria } = await supabase
      .from('categorias')
      .select('id, slug')
      .eq('id', input.categoria_id)
      .maybeSingle();
    if (!categoria) {
      return {
        ok: false,
        error: 'Confira os campos destacados.',
        fieldErrors: { categoria_id: 'Esta categoria não existe mais. Escolha outra.' },
      };
    }

    const values = {
      categoria_id: input.categoria_id,
      nome: input.nome,
      slug: input.slug,
      descricao: input.descricao || null,
      medidas: input.medidas.map((m) => ({ rotulo: m.rotulo || null, valor: m.valor })),
      rendimento: input.rendimento || null,
      rendimento_pecas_m2: input.rendimento_pecas_m2
        ? Number(input.rendimento_pecas_m2.replace(',', '.'))
        : null,
      face: input.face || null,
      observacao_face: input.face ? input.observacao_face || null : null,
      aplicacao: input.aplicacao || null,
      observacoes: input.observacoes || null,
      imagem_principal_url: input.imagem_principal_url,
      imagem_aplicacao_url: input.imagem_aplicacao_url,
      imagens_extras: input.imagens_extras,
      ativo: input.ativo,
      destaque: input.destaque,
    };

    const slugTaken = {
      ok: false as const,
      error: 'Confira os campos destacados.',
      fieldErrors: {
        slug: 'Já existe um produto com este endereço. Mude o final, ex.: acrescente "-2".',
      },
    };

    let productId = id;
    let previousImages: string[] = [];

    if (id) {
      const { data: before } = await supabase
        .from('produtos')
        .select('imagem_principal_url, imagem_aplicacao_url, imagens_extras, categoria_id')
        .eq('id', id)
        .maybeSingle();
      if (!before) return { ok: false, error: 'Este produto não existe mais.' };
      previousImages = [
        before.imagem_principal_url,
        before.imagem_aplicacao_url,
        ...parseStringArray(before.imagens_extras),
      ].filter((v): v is string => Boolean(v));

      // moved to another category: goes to the end of the new one
      let ordem: number | undefined;
      if (before.categoria_id !== input.categoria_id)
        ordem = await nextOrdem(supabase, input.categoria_id);

      const { error } = await supabase
        .from('produtos')
        .update(ordem === undefined ? values : { ...values, ordem })
        .eq('id', id);
      if (error) {
        if (error.code === '23505') return slugTaken;
        throw new Error(error.message);
      }
    } else {
      const ordem = await nextOrdem(supabase, input.categoria_id);
      const { data, error } = await supabase
        .from('produtos')
        .insert({ ...values, ordem })
        .select('id')
        .single();
      if (error) {
        if (error.code === '23505') return slugTaken;
        throw new Error(error.message);
      }
      productId = data.id;
    }

    // colours: replace the whole set, keeping the chosen order
    const cores = [...new Set(input.cores)];
    const del = await supabase.from('produto_cores').delete().eq('produto_id', productId!);
    if (del.error) throw new Error(del.error.message);
    if (cores.length > 0) {
      const ins = await supabase
        .from('produto_cores')
        .insert(cores.map((cor_id, i) => ({ produto_id: productId!, cor_id, ordem: i + 1 })));
      if (ins.error) throw new Error(ins.error.message);
    }

    // files replaced or removed in this edit are no longer referenced anywhere
    const kept = new Set(images.filter(Boolean));
    await removeStorageFiles(
      supabase,
      previousImages.filter((url) => !kept.has(url)),
    );

    revalidateSite('products');
    return {
      ok: true,
      data: { id: productId!, slug: input.slug, categoriaSlug: categoria.slug },
      message: 'Produto salvo com sucesso.',
    };
  });
}

async function nextOrdem(
  supabase: Awaited<ReturnType<typeof requireAdminAction>>['supabase'],
  categoriaId: string,
): Promise<number> {
  const { data } = await supabase
    .from('produtos')
    .select('ordem')
    .eq('categoria_id', categoriaId)
    .order('ordem', { ascending: false })
    .limit(1);
  return (data?.[0]?.ordem ?? 0) + 1;
}

export async function setProdutosAtivo(ids: unknown, ativo: boolean): Promise<ActionResult> {
  return run('produto.ativo', async () => {
    const { supabase } = await requireAdminAction();
    const list = uuidList(ids);
    if (!list || typeof ativo !== 'boolean') return { ok: false, error: GENERIC_ERROR };
    const { error } = await supabase.from('produtos').update({ ativo }).in('id', list);
    if (error) throw new Error(error.message);
    revalidateSite('products');
    const many = list.length > 1;
    return {
      ok: true,
      data: undefined,
      message: ativo
        ? many
          ? 'Produtos ativados. Já aparecem no site.'
          : 'Produto ativado. Já aparece no site.'
        : many
          ? 'Produtos desativados. Não aparecem mais no site.'
          : 'Produto desativado. Não aparece mais no site.',
    };
  });
}

export async function setProdutoDestaque(id: unknown, destaque: boolean): Promise<ActionResult> {
  return run('produto.destaque', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id) || typeof destaque !== 'boolean') return { ok: false, error: GENERIC_ERROR };
    const { error } = await supabase.from('produtos').update({ destaque }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidateSite('products');
    return {
      ok: true,
      data: undefined,
      message: destaque ? 'Produto marcado como destaque.' : 'Produto removido dos destaques.',
    };
  });
}

export async function deleteProdutos(ids: unknown): Promise<ActionResult> {
  return run('produto.excluir', async () => {
    const { supabase } = await requireAdminAction();
    const list = uuidList(ids);
    if (!list) return { ok: false, error: GENERIC_ERROR };

    const { data: rows, error: readError } = await supabase
      .from('produtos')
      .select('imagem_principal_url, imagem_aplicacao_url, imagens_extras')
      .in('id', list);
    if (readError) throw new Error(readError.message);

    const { error } = await supabase.from('produtos').delete().in('id', list);
    if (error) throw new Error(error.message);

    // the rows are gone, so their photos are orphans now
    await removeStorageFiles(
      supabase,
      (rows ?? []).flatMap((r) => [
        r.imagem_principal_url,
        r.imagem_aplicacao_url,
        ...parseStringArray(r.imagens_extras),
      ]),
    );

    revalidateSite('products');
    return {
      ok: true,
      data: undefined,
      message: list.length > 1 ? 'Produtos excluídos.' : 'Produto excluído.',
    };
  });
}

export async function duplicateProduto(id: unknown): Promise<ActionResult<{ id: string }>> {
  return run('produto.duplicar', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id)) return { ok: false, error: GENERIC_ERROR };

    const { data: original } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!original) return { ok: false, error: 'Este produto não existe mais.' };
    const { data: cores } = await supabase
      .from('produto_cores')
      .select('cor_id, ordem')
      .eq('produto_id', id);

    const ordem = await nextOrdem(supabase, original.categoria_id);
    let created: { id: string } | null = null;
    for (let attempt = 1; attempt <= 20 && !created; attempt++) {
      const suffix = attempt === 1 ? '-copia' : `-copia-${attempt}`;
      const { data, error } = await supabase
        .from('produtos')
        .insert({
          categoria_id: original.categoria_id,
          nome: `${original.nome} (cópia)`.slice(0, 120),
          slug: `${original.slug.slice(0, 80 - suffix.length)}${suffix}`,
          descricao: original.descricao,
          medidas: original.medidas,
          rendimento: original.rendimento,
          rendimento_pecas_m2: original.rendimento_pecas_m2,
          face: original.face,
          observacao_face: original.observacao_face,
          aplicacao: original.aplicacao,
          observacoes: original.observacoes,
          // photos are not shared between products: each file belongs to exactly one
          destaque: false,
          ativo: false,
          ordem,
        })
        .select('id')
        .single();
      if (!error) created = data;
      else if (error.code !== '23505') throw new Error(error.message);
    }
    if (!created) return { ok: false, error: GENERIC_ERROR };

    if (cores?.length) {
      const { error } = await supabase
        .from('produto_cores')
        .insert(cores.map((c) => ({ produto_id: created.id, cor_id: c.cor_id, ordem: c.ordem })));
      if (error) throw new Error(error.message);
    }

    revalidateSite('products');
    return {
      ok: true,
      data: { id: created.id },
      message: 'Cópia criada (desativada e sem fotos). Ajuste e ative quando estiver pronta.',
    };
  });
}

export async function reorderProdutos(ids: unknown): Promise<ActionResult> {
  return run('produto.ordenar', async () => {
    const { supabase } = await requireAdminAction();
    const list = uuidList(ids);
    if (!list) return { ok: false, error: GENERIC_ERROR };
    const results = await Promise.all(
      list.map((id, i) =>
        supabase
          .from('produtos')
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
