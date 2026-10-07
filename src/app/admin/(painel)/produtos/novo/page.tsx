import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/admin/auth';
import type { ProdutoInput } from '@/lib/validation/admin';
import { loadFormOptions } from '../load';
import { ProductForm } from '../product-form';

export const metadata: Metadata = { title: 'Novo produto' };

export default async function NovoProdutoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; k?: string }>;
}) {
  const { supabase } = await requireAdminPage();
  const { categoria, k } = await searchParams;
  const { categorias, cores } = await loadFormOptions(supabase);

  const initial: ProdutoInput = {
    categoria_id: categorias.some((c) => c.id === categoria) ? categoria! : '',
    nome: '',
    slug: '',
    descricao: '',
    medidas: [{ rotulo: '', valor: '' }],
    rendimento: '',
    rendimento_pecas_m2: '',
    face: '',
    observacao_face: '',
    aplicacao: '',
    observacoes: '',
    cores: [],
    imagem_principal_url: null,
    imagem_aplicacao_url: null,
    imagens_extras: [],
    ativo: true,
    destaque: false,
  };

  // `key` remounts the form after "Salvar e adicionar outro"
  return (
    <ProductForm
      key={k ?? 'novo'}
      id={null}
      initial={initial}
      categorias={categorias}
      cores={cores}
    />
  );
}
