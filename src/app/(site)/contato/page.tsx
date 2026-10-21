import type { Metadata } from 'next';
import { ContactForm } from '@/components/site/contact-form';
import { JsonLd } from '@/components/site/json-ld';
import { ContactDetails, LocationActions, MapEmbed } from '@/components/site/location-block';
import { PageHeader } from '@/components/site/page-header';
import { SectionLabel } from '@/components/ui/section-label';
import { getSettings } from '@/lib/data';
import { breadcrumbJsonLd, localBusinessJsonLd } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Contato e localização da fábrica em Pinheiral/RJ',
  description:
    'Fale com a Art Terra pelo WhatsApp (24) 99201-1676, e-mail ou formulário. Estrada Benjamin Constant, 4805, Mutirão, Pinheiral/RJ. Veja como chegar.',
  alternates: { canonical: '/contato' },
};

export default async function ContatoPage() {
  const settings = await getSettings();
  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Início', path: '/' },
          { name: 'Contato', path: '/contato' },
        ])}
      />
      <PageHeader
        eyebrow="Contato"
        title="Fale com a fábrica"
        description="Peça um orçamento, tire dúvidas sobre os produtos ou combine uma visita. Respondemos o quanto antes."
      />

      <div className="container-site grid gap-12 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <section aria-labelledby="dados-titulo">
          <SectionLabel>Atendimento</SectionLabel>
          <h2
            id="dados-titulo"
            className="text-brand-green mt-3 mb-6 text-2xl font-bold sm:text-3xl"
          >
            Nossos canais
          </h2>
          <ContactDetails settings={settings} />
          <div className="mt-8">
            <LocationActions settings={settings} />
          </div>
        </section>

        <section aria-labelledby="form-titulo">
          <SectionLabel>Formulário</SectionLabel>
          <h2
            id="form-titulo"
            className="text-brand-green mt-3 mb-6 text-2xl font-bold sm:text-3xl"
          >
            Envie uma mensagem
          </h2>
          <ContactForm whatsapp={settings.whatsapp} />
        </section>
      </div>

      <section
        aria-labelledby="mapa-titulo"
        className="border-line border-t bg-white py-12 sm:py-16"
      >
        <div className="container-site">
          <SectionLabel>Localização</SectionLabel>
          <h2
            id="mapa-titulo"
            className="text-brand-green mt-3 mb-6 text-2xl font-bold sm:text-3xl"
          >
            Como chegar
          </h2>
          <MapEmbed />
        </div>
      </section>
    </>
  );
}
