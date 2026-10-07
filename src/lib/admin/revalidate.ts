import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/site';

type Tag = keyof typeof CACHE_TAGS;

/**
 * Called by every admin mutation: drops the cached data and the rendered public
 * pages, so the site reflects the change within seconds — no new deploy needed.
 */
export function revalidateSite(...tags: Tag[]) {
  for (const tag of tags) revalidateTag(CACHE_TAGS[tag]);
  revalidatePath('/', 'layout');
}
