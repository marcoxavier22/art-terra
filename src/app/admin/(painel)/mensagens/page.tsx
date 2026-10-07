import type { Metadata } from 'next';
import { PageTitle } from '@/components/admin/page-title';
import { requireAdminPage } from '@/lib/admin/auth';
import type { Mensagem } from '@/lib/types';
import { MessagesManager } from './messages-manager';

export const metadata: Metadata = { title: 'Mensagens' };

export default async function MensagensPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase
    .from('mensagens_contato')
    .select('id, nome, telefone, email, assunto, mensagem, lida, created_at')
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);

  return (
    <>
      <PageTitle
        title="Mensagens"
        description="Contatos enviados pelo formulário do site. As não lidas aparecem primeiro, em destaque."
      />
      <MessagesManager initial={data as Mensagem[]} />
    </>
  );
}
