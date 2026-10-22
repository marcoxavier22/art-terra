import type { MetadataRoute } from 'next';
import { getCatalogSafe } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { produtos, categorias } = await getCatalogSafe();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
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
  }));
  const categoryRoutes: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${SITE_URL}/catalogo/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));
  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
