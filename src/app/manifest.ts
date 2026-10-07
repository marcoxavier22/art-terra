import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Art Terra — Pisos, Vasos e Revestimentos',
    short_name: 'Art Terra',
    description: 'Fábrica de pisos de concreto, cobogós e bordas atérmicas em Pinheiral/RJ.',
    start_url: '/',
    display: 'standalone',
    lang: 'pt-BR',
    background_color: '#F8F6F2',
    theme_color: '#1F3721',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
