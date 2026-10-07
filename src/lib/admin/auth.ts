import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export class NotAuthorizedError extends Error {
  constructor() {
    super('Sua sessão expirou ou você não tem permissão. Entre novamente.');
    this.name = 'NotAuthorizedError';
  }
}

/**
 * Verifies, on the server, that the request comes from a logged-in user listed in
 * `admin_users`. `getUser()` validates the token with Supabase Auth (never trust the
 * cookie alone) and the admin lookup runs under RLS, where a user only sees their own row.
 */
async function resolveAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  return { supabase, user, isAdmin: Boolean(data) };
}

/** For pages/layouts: redirects to the login screen when not allowed. */
export async function requireAdminPage() {
  const { supabase, user, isAdmin } = await resolveAdmin();
  if (!user) redirect('/admin/login');
  if (!isAdmin) redirect('/admin/login?erro=permissao');
  return { supabase, user };
}

/** For Server Actions / Route Handlers: throws when not allowed. */
export async function requireAdminAction() {
  const { supabase, user, isAdmin } = await resolveAdmin();
  if (!user || !isAdmin) throw new NotAuthorizedError();
  return { supabase, user };
}
