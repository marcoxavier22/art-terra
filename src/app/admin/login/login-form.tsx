'use client';
import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, LogIn, Mail } from 'lucide-react';
import { Logo } from '@/components/site/logo';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'forgot';

const ERRORS: Record<string, string> = {
  permissao: 'Você não tem permissão para acessar o painel.',
  config: 'O painel ainda não está configurado. Avise o suporte.',
  link: 'O link de recuperação expirou ou já foi usado. Peça um novo.',
};

export function LoginForm({ initialError }: { initialError: string | null }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    initialError ? (ERRORS[initialError] ?? null) : null,
  );
  const [notice, setNotice] = React.useState<string | null>(null);
  const noPermission = initialError === 'permissao';

  async function signOut() {
    setPending(true);
    await createClient().auth.signOut();
    setPending(false);
    setError(null);
    router.replace('/admin/login');
    router.refresh();
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError || !data.user) {
      setPending(false);
      // deliberately generic: never reveal whether the e-mail exists
      setError('E-mail ou senha incorretos.');
      return;
    }
    const { data: admin } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();
    if (!admin) {
      await supabase.auth.signOut();
      setPending(false);
      setError('Você não tem permissão para acessar o painel.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Informe o e-mail da sua conta.');
      return;
    }
    setPending(true);
    // Implicit flow on purpose: the link then works on any device (e.g. requested on the
    // computer, opened on the phone). The PKCE default only works in the same browser.
    const recovery = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false } },
    );
    const { error: resetError } = await recovery.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/nova-senha`,
    });
    if (resetError && (resetError.status === 429 || (resetError.status ?? 0) >= 500)) {
      // 429: e-mail rate limit; 5xx: the e-mail could not be sent. Never says whether the account exists.
      setPending(false);
      setError(
        resetError.status === 429
          ? 'Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo.'
          : 'Não foi possível enviar o e-mail agora. Tente de novo em alguns minutos.',
      );
      return;
    }
    setPending(false);
    // same message whether or not the account exists
    setNotice(
      'Se este e-mail estiver cadastrado, enviamos um link para criar uma nova senha. Confira a caixa de entrada e o spam.',
    );
  }

  return (
    <main className="concrete-grain bg-brand-green-dark flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <Logo variant="white" className="h-20" />
        </div>
        <div className="shadow-lift rounded-2xl bg-white p-6 sm:p-8">
          <h1 className="font-heading text-brand-green text-2xl font-bold">
            {mode === 'login' ? 'Painel administrativo' : 'Recuperar senha'}
          </h1>
          <p className="text-muted mt-1">
            {mode === 'login'
              ? 'Entre para gerenciar os produtos do site.'
              : 'Informe seu e-mail e enviaremos um link para criar uma nova senha.'}
          </p>

          {error ? (
            <div
              role="alert"
              className="border-danger/30 bg-danger/5 text-ink mt-5 flex items-start gap-2.5 rounded-[10px] border p-3.5 text-sm"
            >
              <AlertTriangle className="text-danger mt-0.5 size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-medium">{error}</p>
                {noPermission ? (
                  <button
                    type="button"
                    onClick={signOut}
                    className="text-brand-green mt-1.5 font-semibold underline underline-offset-2"
                  >
                    Sair e entrar com outra conta
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          {notice ? (
            <div
              role="status"
              className="border-brand-green/25 bg-brand-green/5 text-ink mt-5 flex items-start gap-2.5 rounded-[10px] border p-3.5 text-sm"
            >
              <CheckCircle2 className="text-brand-green mt-0.5 size-5 shrink-0" aria-hidden />
              <p>{notice}</p>
            </div>
          ) : null}

          <form
            onSubmit={mode === 'login' ? onLogin : onForgot}
            noValidate
            className="mt-6 space-y-4"
          >
            <Field label="E-mail" htmlFor="login-email">
              <Input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            {mode === 'login' ? (
              <Field label="Senha" htmlFor="login-senha">
                <Input
                  id="login-senha"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
            ) : null}

            <Button type="submit" variant="green" size="lg" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : mode === 'login' ? (
                <LogIn aria-hidden />
              ) : (
                <Mail aria-hidden />
              )}
              {mode === 'login' ? (pending ? 'Entrando…' : 'Entrar') : 'Enviar link de recuperação'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'forgot' : 'login');
                setError(null);
                setNotice(null);
              }}
              className="text-brand-green inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline"
            >
              {mode === 'login' ? 'Esqueci minha senha' : 'Voltar para o login'}
            </button>
          </div>
        </div>
        <Link
          href="/"
          className="mt-6 flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar para o site
        </Link>
      </div>
    </main>
  );
}
