import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { bebas, inter, poppins } from '@/lib/fonts';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Art Terra | Fábrica de Pisos e Cobogós de Concreto em Pinheiral/RJ',
    template: '%s | Art Terra',
  },
  description:
    'Fábrica de pisos de concreto, cobogós, bordas atérmicas para piscina e artefatos de cimento em Pinheiral/RJ. Peça seu orçamento pelo WhatsApp.',
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
    images: [
      { url: '/og.jpg', width: 1200, height: 630, alt: 'Art Terra — Pisos, Vasos e Revestimentos' },
    ],
  },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#1F3721',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable} ${bebas.variable}`}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
