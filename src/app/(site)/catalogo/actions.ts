'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/site';

// Public and harmless: it only asks the server to refetch the catalogue.
export async function retryCatalog() {
  revalidateTag(CACHE_TAGS.products);
  revalidateTag(CACHE_TAGS.categories);
  revalidatePath('/catalogo');
}
