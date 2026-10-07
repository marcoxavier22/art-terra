'use server';
import { revalidatePath } from 'next/cache';
import { requireAdminAction } from '@/lib/admin/auth';
import { GENERIC_ERROR, type ActionResult } from '@/lib/admin/result';
import { isUuid, run } from '@/lib/admin/run';

export async function setMensagemLida(id: unknown, lida: boolean): Promise<ActionResult> {
  return run('mensagem.lida', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id) || typeof lida !== 'boolean') return { ok: false, error: GENERIC_ERROR };
    const { error } = await supabase.from('mensagens_contato').update({ lida }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin', 'layout');
    return {
      ok: true,
      data: undefined,
      message: lida ? 'Mensagem marcada como lida.' : 'Mensagem marcada como não lida.',
    };
  });
}

export async function deleteMensagem(id: unknown): Promise<ActionResult> {
  return run('mensagem.excluir', async () => {
    const { supabase } = await requireAdminAction();
    if (!isUuid(id)) return { ok: false, error: GENERIC_ERROR };
    const { error } = await supabase.from('mensagens_contato').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin', 'layout');
    return { ok: true, data: undefined, message: 'Mensagem excluída.' };
  });
}
