import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

/**
 * Called once a day by Vercel Cron (vercel.json). The free Supabase plan pauses projects
 * after a week without activity, which takes the catalogue and the admin panel offline.
 * One tiny read is enough to count as activity.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { error } = await createPublicClient().from('configuracoes').select('id').limit(1);
  if (error) {
    console.error(`[keepalive] ${error.message}`);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
