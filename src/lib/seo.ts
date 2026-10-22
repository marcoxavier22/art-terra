import { SITE_NAME, SITE_URL } from './site';
import { CIDADES_ATENDIDAS, type Faq } from './seo-content';
import type { Produto, Settings } from './types';

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function localBusinessJsonLd(settings: Settings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#empresa`,
    name: settings.nome_empresa,
    description:
      'Fábrica de pisos de concreto, cobogós, bordas atérmicas para piscina e artefatos de cimento.',
    url: SITE_URL,
    image: absoluteUrl('/og.jpg'),
    logo: absoluteUrl('/icon-512.png'),
    telephone: `+${settings.whatsapp}`,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Estrada Benjamin Constant, 4805, Mutirão (Km 5)',
      addressLocality: 'Pinheiral',
      addressRegion: 'RJ',
      addressCountry: 'BR',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Sul Fluminense' },
      ...CIDADES_ATENDIDAS.map((name) => ({ '@type': 'City', name })),
    ],
    hasMap: 'https://www.google.com/maps/search/?api=1&query=Art+Terra+Pinheiral+RJ',
    priceRange: '$$',
    sameAs: [`https://instagram.com/${settings.instagram}`],
    ...(settings.horario_atendimento ? { openingHours: settings.horario_atendimento } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(produto: Produto) {
  const images = [
    produto.imagem_principal_url,
    produto.imagem_aplicacao_url,
    ...produto.imagens_extras,
  ]
    .filter((v): v is string => Boolean(v))
    .map(absoluteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.nome,
    sku: produto.slug,
    category: produto.categoria.nome,
    url: absoluteUrl(`/catalogo/${produto.categoria.slug}/${produto.slug}`),
    ...(produto.descricao ? { description: produto.descricao } : {}),
    ...(images.length ? { image: images } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    manufacturer: { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}/#empresa` },
    material: 'Concreto',
    ...(produto.cores.length ? { color: produto.cores.map((c) => c.nome).join(', ') } : {}),
  };
}

/** Trims to a clean sentence boundary for <meta name="description"> (≤ 155 chars). */
export function metaDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 60))}…`;
}

export function faqJsonLd(faqs: readonly Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: f.resposta },
    })),
  };
}

export function itemListJsonLd(produtos: Produto[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: produtos.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/catalogo/${p.categoria.slug}/${p.slug}`),
      name: p.nome,
    })),
  };
}
