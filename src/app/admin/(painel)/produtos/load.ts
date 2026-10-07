import 'server-only';
import type { requireAdminPage } from '@/lib/admin/auth';
import { parseMedidas, parseStringArray } from '@/lib/data';
import type { Cor } from '@/lib/types';
import type { ProdutoInput } from '@/lib/validation/admin';

type Client = Awaited<ReturnType<typeof requireAdminPage>>['supabase'];

export interface FormCategoria {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
}

export async function loadFormOptions(supabase: Client) {
  const [categorias, cores] = await Promise.all([
    supabase.from('categorias').select('id, nome, slug, ativo').order('ordem').order('nome'),
    supabase.from('cores').select('id, nome, hex, ordem').order('ordem').order('nome'),
  ]);
  if (categorias.error) throw new Error(categorias.error.message);
  if (cores.error) throw new Error(cores.error.message);
  return { categorias: categorias.data as FormCategoria[], cores: cores.data as Cor[] };
}

export async function loadProduto(supabase: Client, id: string): Promise<ProdutoInput | null> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, produto_cores(cor_id, ordem)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const face = data.face;
  return {
    categoria_id: data.categoria_id,
    nome: data.nome,
    slug: data.slug,
    descricao: data.descricao ?? '',
    medidas: parseMedidas(data.medidas).map((m) => ({ rotulo: m.rotulo ?? '', valor: m.valor })),
    rendimento: data.rendimento ?? '',
    rendimento_pecas_m2:
      data.rendimento_pecas_m2 === null ? '' : String(data.rendimento_pecas_m2).replace('.', ','),
    face: face === 'uma_face' || face === 'dupla_face' || face === 'uma_ou_dupla' ? face : '',
    observacao_face: data.observacao_face ?? '',
    aplicacao: data.aplicacao ?? '',
    observacoes: data.observacoes ?? '',
    cores: [...(data.produto_cores ?? [])].sort((a, b) => a.ordem - b.ordem).map((c) => c.cor_id),
    imagem_principal_url: data.imagem_principal_url,
    imagem_aplicacao_url: data.imagem_aplicacao_url,
    imagens_extras: parseStringArray(data.imagens_extras),
    ativo: data.ativo,
    destaque: data.destaque,
  };
}
