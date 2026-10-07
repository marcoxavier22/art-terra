import { AdminShell } from '@/components/admin/admin-shell';
import { requireAdminPage } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate (in addition to the middleware).
  const { supabase, user } = await requireAdminPage();
  const { count } = await supabase
    .from('mensagens_contato')
    .select('id', { count: 'exact', head: true })
    .eq('lida', false);

  return (
    <AdminShell email={user.email ?? ''} unread={count ?? 0}>
      {children}
    </AdminShell>
  );
}
