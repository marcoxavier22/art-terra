import type { MetadataRoute } from 'next';
import { getCatalogSafe, getGallery } from '@/lib/data';
import { absoluteUrl } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ produtos, categorias }, galeria] = await Promise.all([getCatalogSafe(), getGallery()]);
  // Image sitemap entries: Google Images discovers the WebP photos through their pages.
  const imgs = (...urls: (string | null | undefined)[]) =>
    urls.filter((u): u is string => Boolean(u)).map(absoluteUrl);
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      images: imgs(...galeria.map((g) => g.imagem_url)),
    },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/sobre`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE_URL}/contato`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_URL}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
  const productRoutes: MetadataRoute.Sitemap = produtos.map((p) => ({
    url: `${SITE_URL}/catalogo/${p.categoria.slug}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
    images: imgs(p.imagem_principal_url, p.imagem_aplicacao_url, ...p.imagens_extras),
  }));
  const categoryRoutes: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${SITE_URL}/catalogo/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
    images: imgs(c.imagem_capa_url),
  }));
  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
