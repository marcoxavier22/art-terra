import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const BUCKETS = ['produtos', 'documentos'] as const;
const SEED_PREFIX = '/seed-images/';

function storagePrefix(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base.replace(/\/+$/, '')}/storage/v1/object/public/` : null;
}

/** Splits one of OUR public Storage URLs into bucket + path; anything else returns null. */
export function parseStorageUrl(url: string | null | undefined) {
  const prefix = storagePrefix();
  if (!url || !prefix || !url.startsWith(prefix)) return null;
  const rest = decodeURIComponent(url.slice(prefix.length).split('?')[0]);
  const slash = rest.indexOf('/');
  if (slash < 1) return null;
  const bucket = rest.slice(0, slash);
  const path = rest.slice(slash + 1);
  if (!(BUCKETS as readonly string[]).includes(bucket) || !path || path.includes('..')) return null;
  return { bucket, path };
}

/** Only images hosted in our bucket (or the bundled seed photos) may be saved to the database. */
export function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith(SEED_PREFIX) && !url.includes('..')) return true;
  return parseStorageUrl(url)?.bucket === 'produtos';
}

export function isAllowedDocumentUrl(url: string): boolean {
  return parseStorageUrl(url)?.bucket === 'documentos';
}

/** Best-effort removal of files that are no longer referenced. Never throws. */
export async function removeStorageFiles(
  supabase: SupabaseClient<Database>,
  urls: (string | null | undefined)[],
) {
  const byBucket = new Map<string, string[]>();
  for (const url of urls) {
    const parsed = parseStorageUrl(url);
    if (!parsed) continue;
    byBucket.set(parsed.bucket, [...(byBucket.get(parsed.bucket) ?? []), parsed.path]);
  }
  for (const [bucket, paths] of byBucket) {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) console.error(`[storage] falha ao remover arquivos órfãos: ${error.message}`);
  }
}
