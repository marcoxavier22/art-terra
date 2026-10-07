import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/admin/auth';
import { isUuid } from '@/lib/admin/run';
import { loadFormOptions, loadProduto } from '../load';
import { ProductForm } from '../product-form';

export const metadata: Metadata = { title: 'Editar produto' };

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdminPage();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [options, produto] = await Promise.all([
    loadFormOptions(supabase),
    loadProduto(supabase, id),
  ]);
  if (!produto) notFound();
  return (
    <ProductForm id={id} initial={produto} categorias={options.categorias} cores={options.cores} />
  );
}
