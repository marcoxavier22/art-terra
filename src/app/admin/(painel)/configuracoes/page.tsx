import type { Metadata } from 'next';
import { PageTitle } from '@/components/admin/page-title';
import { requireAdminPage } from '@/lib/admin/auth';
import { maskPhoneBR } from '@/lib/text';
import type { ConfiguracoesInput } from '@/lib/validation/admin';
import { SettingsForm } from './settings-form';

export const metadata: Metadata = { title: 'Configurações' };

export default async function ConfiguracoesPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
  if (error) throw new Error(error.message);

  const initial: ConfiguracoesInput = {
    nome_empresa: data.nome_empresa,
    slogan: data.slogan ?? '',
    whatsapp: maskPhoneBR(data.whatsapp),
    email: data.email ?? '',
    instagram: data.instagram ?? '',
    endereco: data.endereco ?? '',
    horario_atendimento: data.horario_atendimento ?? '',
    hero_titulo: data.hero_titulo ?? '',
    hero_subtitulo: data.hero_subtitulo ?? '',
    hero_imagem_url: data.hero_imagem_url,
    catalogo_pdf_url: data.catalogo_pdf_url,
  };

  return (
    <>
      <PageTitle
        title="Configurações"
        description="Dados da empresa, textos do topo da página inicial e o PDF do catálogo."
      />
      <SettingsForm initial={initial} />
    </>
  );
}
