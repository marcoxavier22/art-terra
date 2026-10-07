import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Landing point of the password-recovery e-mail. Supports both link formats used by
 * Supabase: `?code=` (PKCE) and `?token_hash=&type=recovery` (custom e-mail template).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const nextParam = searchParams.get('next') ?? '/admin/nova-senha';
  // only same-site admin paths, to avoid open redirects
  const next = nextParam.startsWith('/admin') && !nextParam.startsWith('//') ? nextParam : '/admin';

  const supabase = await createClient();
  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }
  return NextResponse.redirect(`${origin}${ok ? next : '/admin/login?erro=link'}`);
}
