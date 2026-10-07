import { notFound, redirect } from 'next/navigation';
import { getCatalog } from '@/lib/data';

// /catalogo/cobogos is a natural URL to guess: send it to the filtered catalogue.
export default async function CategoryRedirect({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const { categorias } = await getCatalog();
  if (!categorias.some((c) => c.slug === categoria)) notFound();
  redirect(`/catalogo?cat=${categoria}`);
}
