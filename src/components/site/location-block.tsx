import { Clock, Mail, MapPin, Navigation } from 'lucide-react';
import { MAPS_DIRECTIONS_URL, MAPS_EMBED_URL } from '@/lib/site';
import { formatWhatsappDisplay } from '@/lib/text';
import { DEFAULT_QUOTE_MESSAGE, whatsappUrl } from '@/lib/whatsapp';
import type { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { InstagramIcon, WhatsAppIcon } from '@/components/ui/icons';

export function MapEmbed() {
  return (
    <iframe
      src={MAPS_EMBED_URL}
      title="Mapa: localização da fábrica Art Terra na Estrada Benjamin Constant, 4805, Pinheiral/RJ"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className="bg-sand shadow-soft block h-[320px] w-full rounded-[12px] border-0 md:h-[420px]"
    />
  );
}

export function ContactDetails({ settings }: { settings: Settings }) {
  const rowClass = 'flex items-start gap-3.5';
  const iconWrap =
    'grid size-11 shrink-0 place-items-center rounded-[10px] bg-brand-green/8 text-brand-green';
  const linkClass =
    'inline-flex min-h-11 items-center font-medium text-ink underline-offset-4 hover:text-brand-green hover:underline';
  return (
    <ul className="space-y-4">
      <li className={rowClass}>
        <span className={iconWrap} aria-hidden>
          <MapPin className="size-5" />
        </span>
        <div>
          <p className="text-muted text-sm font-semibold">Endereço</p>
          <address className="text-ink leading-relaxed not-italic">{settings.endereco}</address>
        </div>
      </li>
      <li className={rowClass}>
        <span className={iconWrap} aria-hidden>
          <WhatsAppIcon className="size-5" />
        </span>
        <div>
          <p className="text-muted text-sm font-semibold">WhatsApp</p>
          <a
            href={whatsappUrl(settings.whatsapp, DEFAULT_QUOTE_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {formatWhatsappDisplay(settings.whatsapp)}
          </a>
        </div>
      </li>
      <li className={rowClass}>
        <span className={iconWrap} aria-hidden>
          <Mail className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-muted text-sm font-semibold">E-mail</p>
          <a href={`mailto:${settings.email}`} className={`${linkClass} break-all`}>
            {settings.email}
          </a>
        </div>
      </li>
      <li className={rowClass}>
        <span className={iconWrap} aria-hidden>
          <InstagramIcon className="size-5" />
        </span>
        <div>
          <p className="text-muted text-sm font-semibold">Instagram</p>
          <a
            href={`https://instagram.com/${settings.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            @{settings.instagram}
          </a>
        </div>
      </li>
      {settings.horario_atendimento ? (
        <li className={rowClass}>
          <span className={iconWrap} aria-hidden>
            <Clock className="size-5" />
          </span>
          <div>
            <p className="text-muted text-sm font-semibold">Horário de atendimento</p>
            <p className="text-ink leading-relaxed whitespace-pre-line">
              {settings.horario_atendimento}
            </p>
          </div>
        </li>
      ) : null}
    </ul>
  );
}

export function LocationActions({ settings }: { settings: Settings }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button asChild variant="whatsapp" size="lg" className="flex-1">
        <a
          href={whatsappUrl(settings.whatsapp, DEFAULT_QUOTE_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon />
          Chamar no WhatsApp
        </a>
      </Button>
      <Button asChild variant="outline" size="lg" className="flex-1">
        <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
          <Navigation />
          Como chegar
        </a>
      </Button>
    </div>
  );
}
