import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { maskPhoneBR, onlyDigits } from '@/lib/text';
import { contactRequestSchema, sanitizeText } from '@/lib/validation/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Requisição inválida.' }, 400);
  }

  const parsed = contactRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      fieldErrors[key] ??= issue.message;
    }
    return json({ ok: false, error: 'Confira os campos destacados.', fieldErrors }, 422);
  }
  const data = parsed.data;

  // Honeypot filled, or submitted faster than a person could type: pretend success, store nothing.
  if (data.website || (data.elapsed !== undefined && data.elapsed < 1500)) {
    return json({ ok: true }, 200);
  }

  const secret = process.env.CONTACT_FORM_SECRET;
  if (!secret) {
    console.error('[contato] CONTACT_FORM_SECRET não configurado');
    return json({ ok: false, error: 'Formulário indisponível no momento.' }, 503);
  }

  // The IP is only ever stored as a salted hash, used for the 3-per-10-minutes limit.
  const ipHash = createHash('sha256')
    .update(`${secret}:${clientIp(request)}`)
    .digest('hex');

  try {
    const { url, key } = getSupabaseEnv();
    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-contact-secret': secret } },
    });
    const { error } = await supabase.from('mensagens_contato').insert({
      nome: sanitizeText(data.nome),
      telefone: maskPhoneBR(onlyDigits(data.telefone)),
      email: data.email ? data.email.toLowerCase() : null,
      assunto: data.assunto,
      mensagem: sanitizeText(data.mensagem),
      ip_hash: ipHash,
    });

    if (error) {
      if (error.message.includes('contato_limite_excedido')) {
        return json(
          {
            ok: false,
            error:
              'Você já enviou algumas mensagens há pouco. Aguarde uns minutos ou fale com a gente pelo WhatsApp.',
          },
          429,
        );
      }
      // never log the message body or contact details
      console.error(`[contato] falha ao gravar: ${error.code ?? ''} ${error.message}`);
      return json({ ok: false, error: 'Não foi possível enviar agora.' }, 502);
    }
  } catch (error) {
    console.error(
      `[contato] erro inesperado: ${error instanceof Error ? error.message : 'desconhecido'}`,
    );
    return json({ ok: false, error: 'Não foi possível enviar agora.' }, 502);
  }

  return json({ ok: true }, 201);
}
