import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

// Reachable without a session.
// /admin/nova-senha receives the recovery tokens in the URL fragment (#), which never
// reaches the server, so the page itself checks the session.
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/auth/callback', '/admin/nova-senha'];
// Reachable with a session even if the user is not an admin (password recovery).
const SESSION_ONLY_PATHS = ['/admin/nova-senha'];

/**
 * Guards everything under /admin: refreshes the Supabase session cookie and only
 * lets admins through. Server Actions and pages repeat the check on the server —
 * this middleware is a first barrier, not the only one.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const redirectTo = (path: string, params: Record<string, string> = {}) => {
    const target = request.nextUrl.clone();
    target.pathname = path;
    target.search = '';
    for (const [k, v] of Object.entries(params)) target.searchParams.set(k, v);
    const redirect = NextResponse.redirect(target);
    // keep any refreshed auth cookies
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!url || !key) {
    return isPublic ? response : redirectTo('/admin/login', { erro: 'config' });
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() validates the JWT against Supabase Auth and refreshes it when needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === '/admin/auth/callback' || pathname === '/admin/nova-senha') return response;

  if (!user) {
    return isPublic ? response : redirectTo('/admin/login');
  }

  if (SESSION_ONLY_PATHS.includes(pathname)) return response;

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) {
    // logged in but not an admin: only the login screen (which shows the message) is allowed
    if (pathname === '/admin/login') return response;
    return redirectTo('/admin/login', { erro: 'permissao' });
  }

  if (pathname === '/admin/login') return redirectTo('/admin');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
