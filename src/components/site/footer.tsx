import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';
import { MAPS_DIRECTIONS_URL, NAV_LINKS } from '@/lib/site';
import { formatWhatsappDisplay } from '@/lib/text';
import { whatsappUrl } from '@/lib/whatsapp';
import type { CategoriaComContagem, Settings } from '@/lib/types';
import { InstagramIcon, WhatsAppIcon } from '@/components/ui/icons';
import { Logo } from './logo';

const linkClass =
  'inline-flex min-h-11 items-center rounded text-white/80 transition-colors hover:text-brand-orange sm:min-h-9';

export function Footer({
  settings,
  categorias,
}: {
  settings: Settings;
  categorias: CategoriaComContagem[];
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="concrete-grain bg-brand-green-dark text-white">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.3fr] lg:gap-12">
        <div>
          <Link href="/" aria-label="Art Terra — página inicial" className="inline-block rounded">
            <Logo variant="white" className="h-16" />
          </Link>
          <p className="mt-5 max-w-xs leading-relaxed text-white/75">
            Fábrica de pisos, cobogós, bordas atérmicas e artefatos de concreto. Direto de
            Pinheiral/RJ para a sua obra.
          </p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h2 className="font-heading text-brand-orange text-sm font-semibold tracking-[0.16em] uppercase">
            Navegação
          </h2>
          <ul className="mt-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Linhas do catálogo">
          <h2 className="font-heading text-brand-orange text-sm font-semibold tracking-[0.16em] uppercase">
            Catálogo
          </h2>
          <ul className="mt-3">
            {categorias.map((c) => (
              <li key={c.id}>
                <Link href={`/catalogo?cat=${c.slug}`} className={linkClass}>
                  {c.nome}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/catalogo" className={linkClass}>
                Ver todos os produtos
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-heading text-brand-orange text-sm font-semibold tracking-[0.16em] uppercase">
            Contato
          </h2>
          <ul className="mt-3 space-y-1">
            <li>
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} items-start gap-3 py-2`}
              >
                <MapPin className="text-brand-orange mt-0.5 size-5 shrink-0" aria-hidden />
                <address className="not-italic">{settings.endereco}</address>
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} gap-3`}
              >
                <WhatsAppIcon className="text-brand-orange size-5 shrink-0" />
                {formatWhatsappDisplay(settings.whatsapp)}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className={`${linkClass} gap-3 break-all`}>
                <Mail className="text-brand-orange size-5 shrink-0" aria-hidden />
                {settings.email}
              </a>
            </li>
            <li>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} gap-3`}
              >
                <InstagramIcon className="text-brand-orange size-5 shrink-0" />@{settings.instagram}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/12">
        {/* right padding keeps the text clear of the floating WhatsApp button */}
        <div className="container-site flex flex-col gap-2 py-6 pr-24 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between sm:pr-28">
          <p>© {year} Art Terra — Pisos, Vasos e Revestimentos. Todos os direitos reservados.</p>
          <Link
            href="/privacidade"
            className="hover:text-brand-orange inline-flex min-h-11 items-center sm:min-h-0"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
