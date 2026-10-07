import type { Metadata } from 'next';
import { PageTitle } from '@/components/admin/page-title';
import { requireAdminPage } from '@/lib/admin/auth';
import { CategoriesManager, type AdminCategoria } from './categories-manager';

export const metadata: Metadata = { title: 'Categorias' };

export default async function CategoriasPage() {
  const { supabase } = await requireAdminPage();
  const [categoriasRes, produtosRes] = await Promise.all([
    supabase
      .from('categorias')
      .select('id, slug, nome, descricao, imagem_capa_url, ordem, ativo')
      .order('ordem')
      .order('nome'),
    supabase.from('produtos').select('categoria_id'),
  ]);
  if (categoriasRes.error) throw new Error(categoriasRes.error.message);
  if (produtosRes.error) throw new Error(produtosRes.error.message);

  const totals = new Map<string, number>();
  for (const p of produtosRes.data)
    totals.set(p.categoria_id, (totals.get(p.categoria_id) ?? 0) + 1);
  const categorias: AdminCategoria[] = categoriasRes.data.map((c) => ({
    ...c,
    produtos: totals.get(c.id) ?? 0,
  }));

  return (
    <>
      <PageTitle
        title="Categorias"
        description="As linhas do catálogo. A ordem daqui é a ordem das abas no site e dos cartões na página inicial."
      />
      <CategoriesManager initial={categorias} />
    </>
  );
}
