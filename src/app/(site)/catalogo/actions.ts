'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/site';

// Public and harmless: it only asks the server to refetch the catalogue.
// Public action: throttled so nobody can hammer the database by spamming "Tentar de novo".
let lastRetry = 0;

export async function retryCatalog() {
  const now = Date.now();
  if (now - lastRetry < 30_000) return;
  lastRetry = now;
  revalidateTag(CACHE_TAGS.products);
  revalidateTag(CACHE_TAGS.categories);
  revalidatePath('/catalogo', 'layout');
}
