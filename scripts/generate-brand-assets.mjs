// Generates favicon, PWA icons, apple-touch-icon and the 1200x630 Open Graph image
// from the vector logo in public/brand. Run with: pnpm brand:assets
import fs from 'node:fs';
import sharp from 'sharp';

const GREEN_DARK = '#1F3721';
const OFFWHITE = '#F8F6F2';
const icon = fs.readFileSync('public/brand/icon.svg');
const logoWhite = fs.readFileSync('public/brand/logo-white.svg');

async function square(size, { background, scale, out }) {
  const inner = Math.round(size * scale);
  const mark = await sharp(icon, { density: 600 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(out);
}

await square(512, { background: OFFWHITE, scale: 0.8, out: 'public/icon-512.png' });
await square(192, { background: OFFWHITE, scale: 0.8, out: 'public/icon-192.png' });
await square(512, { background: OFFWHITE, scale: 0.58, out: 'public/icon-maskable-512.png' });
await square(180, { background: OFFWHITE, scale: 0.78, out: 'src/app/apple-icon.png' });
await square(96, { background: { r: 0, g: 0, b: 0, alpha: 0 }, scale: 1, out: 'src/app/icon.png' });

// favicon.ico: a 48px PNG wrapped in a minimal ICO container
const png48 = await sharp(icon, { density: 600 })
  .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(48, 6);
header.writeUInt8(48, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png48.length, 14);
header.writeUInt32LE(22, 18);
fs.writeFileSync('src/app/favicon.ico', Buffer.concat([header, png48]));

// Open Graph: photo on the right, brand green panel with the white logo on the left
const W = 1200;
const H = 630;
const photo = await sharp('src/assets/site/hero-fachada.webp')
  .resize(700, H, { fit: 'cover', position: 'centre' })
  .toBuffer();
const gradient = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" x2="1">
      <stop offset="0" stop-color="${GREEN_DARK}"/><stop offset="0.46" stop-color="${GREEN_DARK}"/>
      <stop offset="0.7" stop-color="${GREEN_DARK}" stop-opacity="0.55"/><stop offset="1" stop-color="${GREEN_DARK}" stop-opacity="0.05"/>
    </linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect x="0" y="0" width="220" height="12" fill="#F5871F"/>
    <rect x="72" y="430" width="16" height="16" fill="#F5871F"/>
    <text x="102" y="445" font-family="Helvetica, Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="5" fill="#F5871F">CATÁLOGO 2025</text>
    <text x="72" y="505" font-family="Helvetica, Arial, sans-serif" font-size="43" font-weight="700" fill="#FFFFFF">Pisos, cobogós e bordas</text>
    <text x="72" y="560" font-family="Helvetica, Arial, sans-serif" font-size="43" font-weight="700" fill="#FFFFFF">atérmicas de concreto</text>
  </svg>`,
);
const logo = await sharp(logoWhite, { density: 400 }).resize({ width: 470 }).png().toBuffer();
await sharp({ create: { width: W, height: H, channels: 3, background: GREEN_DARK } })
  .composite([
    { input: photo, left: W - 700, top: 0 },
    { input: gradient, left: 0, top: 0 },
    { input: logo, left: 60, top: 130 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile('public/og.jpg');

console.log('brand assets generated');
