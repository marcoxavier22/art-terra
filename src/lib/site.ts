export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'Art Terra';
export const SITE_TAGLINE = 'Pisos · Vasos · Revestimentos';

export const FALLBACK_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524992290708';

export const MAPS_QUERY = 'Estrada+Benjamin+Constant+4805+Mutir%C3%A3o+Pinheiral+RJ';
export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;
export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}`;

export const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/contato', label: 'Contato' },
] as const;

export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  settings: 'settings',
  gallery: 'gallery',
} as const;

export const CONTACT_SUBJECTS = [
  'Orçamento',
  'Dúvida sobre produto',
  'Revenda/Parceria',
  'Outro',
] as const;

/** Neutral concrete-toned blur used while remote images load. */
export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0IDMiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiNkOWQ1Y2MiLz48L3N2Zz4=';
