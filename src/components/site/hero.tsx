import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Factory, Layers3, Truck } from 'lucide-react';
import heroFachada from '@/assets/site/hero-fachada.webp';
import { BLUR_DATA_URL } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';

export function Hero({
  titulo,
  subtitulo,
  imagemUrl,
  whatsappHref,
  modelos,
}: {
  titulo: string;
  subtitulo: string;
  imagemUrl: string | null;
  whatsappHref: string;
  modelos: number;
}) {
  const badges = [
    { icon: Factory, label: 'Fábrica própria em Pinheiral/RJ' },
    { icon: Truck, label: 'Atende obras e revendas' },
    ...(modelos >= 10 ? [{ icon: Layers3, label: `+${modelos} modelos em linha` }] : []),
  ];
  const imageClass = 'object-cover object-[78%_35%] lg:object-[60%_40%]';
  const sizes = '(min-width: 1024px) 62vw, 100vw';

  return (
    <section
      aria-labelledby="hero-titulo"
      className="bg-brand-green-dark relative isolate flex min-h-[calc(100svh-68px)] items-center overflow-hidden sm:min-h-[78vh]"
    >
      {/* photo: full-bleed on phones, right-hand 62% on desktop */}
      <div className="absolute inset-0 -z-20 lg:left-auto lg:w-[62%]">
        {imagemUrl ? (
          <Image
            src={imagemUrl}
            alt="Fachada com painel de cobogós de concreto da Art Terra"
            fill
            priority
            sizes={sizes}
            quality={80}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className={imageClass}
          />
        ) : (
          <Image
            src={heroFachada}
            alt="Fachada residencial com porta de madeira e painel de cobogós de concreto"
            fill
            priority
            sizes={sizes}
            quality={80}
            placeholder="blur"
            className={imageClass}
          />
        )}
      </div>
      {/* directional gradient: dense behind the text (left), almost clear on the right */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgb(31_55_33/0.93)_0%,rgb(31_55_33/0.8)_50%,rgb(31_55_33/0.5)_100%)] lg:bg-[linear-gradient(90deg,rgb(31_55_33)_0%,rgb(31_55_33)_36%,rgb(31_55_33/0.88)_46%,rgb(31_55_33/0.4)_68%,rgb(31_55_33/0.06)_100%)]"
      />

      <div className="container-site py-14 sm:py-20">
        <div className="max-w-[40rem]">
          <p className="font-heading text-brand-orange flex items-center gap-2.5 text-[0.78rem] font-semibold tracking-[0.22em] uppercase sm:text-sm">
            <span aria-hidden className="bg-brand-orange inline-block size-2.5 shrink-0" />
            Pisos · Vasos · Revestimentos
          </p>
          <h1
            id="hero-titulo"
            className="font-heading mt-5 text-[clamp(2.25rem,5vw,4rem)] leading-[1.06] font-extrabold tracking-tight text-white"
          >
            {titulo}
          </h1>
          <p className="mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-white/88 sm:text-lg">
            {subtitulo}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/catalogo">
                Ver Catálogo
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outlineLight" size="lg" className="w-full sm:w-auto">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon />
                Solicitar Orçamento
              </a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {badges.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="bg-brand-green-dark/55 flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-2 text-[0.82rem] font-medium text-white backdrop-blur-sm"
              >
                <Icon className="text-brand-orange size-4 shrink-0" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a
        href="#sobre"
        aria-label="Rolar para a próxima seção"
        className="hover:text-brand-orange absolute bottom-4 left-1/2 hidden size-11 -translate-x-1/2 place-items-center rounded-full text-white/80 md:grid"
      >
        <ChevronDown className="animate-bob size-6" aria-hidden />
      </a>
    </section>
  );
}
