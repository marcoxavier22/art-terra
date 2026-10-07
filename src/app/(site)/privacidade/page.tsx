import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/page-header';
import { getSettings } from '@/lib/data';
import { formatWhatsappDisplay } from '@/lib/text';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Saiba quais dados a Art Terra coleta pelo site, para que são usados e como pedir a correção ou exclusão, conforme a LGPD.',
  alternates: { canonical: '/privacidade' },
};

export default async function PrivacidadePage() {
  const settings = await getSettings();
  const h2 = 'mt-10 text-xl font-bold text-brand-green sm:text-2xl';
  return (
    <>
      <PageHeader
        eyebrow="LGPD"
        title="Política de Privacidade"
        description="Explicamos de forma simples quais dados coletamos e o que fazemos com eles."
      />
      <article className="container-site text-ink/85 max-w-3xl py-12 text-lg leading-relaxed sm:py-16">
        <p>
          Esta política vale para o site da {settings.nome_empresa} e segue a Lei Geral de Proteção
          de Dados (Lei nº 13.709/2018).
        </p>

        <h2 className={h2}>Quais dados coletamos</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            <strong>Formulário de contato:</strong> nome, telefone/WhatsApp, e-mail (se você
            informar), assunto e a mensagem que você escrever.
          </li>
          <li>
            <strong>Proteção contra abuso:</strong> um código embaralhado (hash) gerado a partir do
            seu endereço IP, usado apenas para limitar envios repetidos. Não guardamos o IP em si.
          </li>
          <li>
            <strong>Estatísticas de acesso:</strong> dados agregados e anônimos de visitas e de
            desempenho das páginas, sem cookies de publicidade.
          </li>
        </ul>

        <h2 className={h2}>Para que usamos</h2>
        <p className="mt-3">
          Usamos seus dados apenas para retornar o seu contato, enviar orçamentos e tirar dúvidas
          sobre os produtos. Não vendemos nem compartilhamos seus dados para fins de marketing de
          terceiros.
        </p>

        <h2 className={h2}>WhatsApp, Instagram e Google Maps</h2>
        <p className="mt-3">
          Ao clicar nos botões de WhatsApp, Instagram ou no mapa, você passa a usar serviços de
          outras empresas, que têm as próprias políticas de privacidade.
        </p>

        <h2 className={h2}>Onde os dados ficam e por quanto tempo</h2>
        <p className="mt-3">
          As mensagens ficam armazenadas em um banco de dados com acesso restrito à equipe da{' '}
          {settings.nome_empresa} e são mantidas pelo tempo necessário para o atendimento. Depois
          disso, são excluídas.
        </p>

        <h2 className={h2}>Seus direitos</h2>
        <p className="mt-3">
          Você pode pedir a qualquer momento para consultar, corrigir ou excluir os dados que nos
          enviou. Basta escrever para{' '}
          <a href={`mailto:${settings.email}`} className="text-brand-green font-semibold underline">
            {settings.email}
          </a>{' '}
          ou chamar no WhatsApp {formatWhatsappDisplay(settings.whatsapp)}.
        </p>

        <h2 className={h2}>Responsável</h2>
        <address className="mt-3 not-italic">
          {settings.nome_empresa} — {settings.endereco}
        </address>
      </article>
    </>
  );
}
