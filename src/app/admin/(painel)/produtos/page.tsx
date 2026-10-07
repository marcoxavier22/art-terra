import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageTitle } from '@/components/admin/page-title';
import { Button } from '@/components/ui/button';
import { requireAdminPage } from '@/lib/admin/auth';
import { ProductsManager, type AdminProduto } from './products-manager';

export const metadata: Metadata = { title: 'Produtos' };

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; status?: string }>;
}) {
  const { supabase } = await requireAdminPage();
  const params = await searchParams;
  const [produtosRes, categoriasRes] = await Promise.all([
    supabase
      .from('produtos')
      .select(
        'id, nome, slug, categoria_id, ativo, destaque, ordem, imagem_principal_url, produto_cores(cor_id)',
      )
      .order('ordem')
      .order('nome'),
    supabase.from('categorias').select('id, nome, slug, ordem, ativo').order('ordem').order('nome'),
  ]);
  if (produtosRes.error) throw new Error(produtosRes.error.message);
  if (categoriasRes.error) throw new Error(categoriasRes.error.message);

  const produtos: AdminProduto[] = produtosRes.data.map((p) => ({
    id: p.id,
    nome: p.nome,
    slug: p.slug,
    categoria_id: p.categoria_id,
    ativo: p.ativo,
    destaque: p.destaque,
    ordem: p.ordem,
    imagem: p.imagem_principal_url,
    cores: (p.produto_cores ?? []).length,
  }));

  return (
    <>
      <PageTitle
        title="Produtos"
        description="Ative, desative, reordene e edite os produtos que aparecem no catálogo."
      >
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus />
            Novo produto
          </Link>
        </Button>
      </PageTitle>
      <ProductsManager
        initialProdutos={produtos}
        categorias={categoriasRes.data}
        initialCategoria={params.categoria ?? ''}
        initialStatus={
          params.status === 'ativos' || params.status === 'inativos' ? params.status : ''
        }
      />
    </>
  );
}
