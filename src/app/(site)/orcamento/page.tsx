import type { Metadata } from 'next';
import { QuoteList } from '@/components/quote/quote-list';
import { PageHeader } from '@/components/site/page-header';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Lista de orçamento',
  description: 'Revise os produtos escolhidos e envie o pedido de orçamento pelo WhatsApp.',
  alternates: { canonical: '/orcamento' },
  // personal, per-visitor page: nothing for search engines here
  robots: { index: false, follow: true },
};

export default async function QuotePage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        eyebrow="Seu pedido"
        title="Lista de orçamento"
        description="Ajuste as quantidades e envie tudo em uma única mensagem. Respondemos com preço, prazo e frete."
      />
      <QuoteList whatsapp={settings.whatsapp} />
    </>
  );
}
