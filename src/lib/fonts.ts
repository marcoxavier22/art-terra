import localFont from 'next/font/local';

// Self-hosted through next/font (no request to Google at build or runtime).
export const poppins = localFont({
  variable: '--font-poppins',
  display: 'swap',
  src: [
    { path: '../fonts/poppins-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/poppins-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/poppins-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/poppins-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
});

export const inter = localFont({
  variable: '--font-inter',
  display: 'swap',
  src: [
    { path: '../fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
});

export const bebas = localFont({
  variable: '--font-bebas',
  display: 'swap',
  preload: false,
  src: [{ path: '../fonts/bebas-neue-latin-400-normal.woff2', weight: '400', style: 'normal' }],
});
