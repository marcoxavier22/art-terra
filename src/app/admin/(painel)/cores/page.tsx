import type { Metadata } from 'next';
import { PageTitle } from '@/components/admin/page-title';
import { requireAdminPage } from '@/lib/admin/auth';
import { ColorsManager, type AdminCor } from './colors-manager';

export const metadata: Metadata = { title: 'Cores' };

export default async function CoresPage() {
  const { supabase } = await requireAdminPage();
  const [coresRes, usoRes] = await Promise.all([
    supabase.from('cores').select('id, nome, hex, ordem').order('ordem').order('nome'),
    supabase.from('produto_cores').select('cor_id'),
  ]);
  if (coresRes.error) throw new Error(coresRes.error.message);
  if (usoRes.error) throw new Error(usoRes.error.message);

  const uso = new Map<string, number>();
  for (const row of usoRes.data) uso.set(row.cor_id, (uso.get(row.cor_id) ?? 0) + 1);
  const cores: AdminCor[] = coresRes.data.map((c) => ({ ...c, produtos: uso.get(c.id) ?? 0 }));

  return (
    <>
      <PageTitle
        title="Cores e acabamentos"
        description="Cores que podem ser marcadas nos produtos. A bolinha é só uma amostra aproximada."
      />
      <ColorsManager initial={cores} />
    </>
  );
}
