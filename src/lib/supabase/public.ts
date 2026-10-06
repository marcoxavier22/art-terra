import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

/**
 * Cookie-less client for public, cacheable reads. It always acts as the `anon`
 * role, so Row Level Security only ever exposes active rows.
 */
export function createPublicClient() {
  const { url, key } = getSupabaseEnv();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
