import type { Metadata } from 'next';
import { PageTitle } from '@/components/admin/page-title';
import { requireAdminPage } from '@/lib/admin/auth';
import type { GaleriaItem } from '@/lib/types';
import { GalleryManager } from './gallery-manager';

export const metadata: Metadata = { title: 'Galeria' };

export default async function GaleriaPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase
    .from('galeria')
    .select('id, imagem_url, legenda, alt, ordem, ativo')
    .order('ordem')
    .order('created_at');
  if (error) throw new Error(error.message);

  return (
    <>
      <PageTitle
        title="Galeria de obras"
        description="Fotos de projetos realizados, mostradas na página inicial em “Nossas peças em obra”."
      />
      <GalleryManager initial={data as GaleriaItem[]} />
    </>
  );
}
