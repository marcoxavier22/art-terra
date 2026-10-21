'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/site/logo';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { createClient } from '@/lib/supabase/client';

export function NewPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // 'checking' until we know whether the recovery link gave us a session
  const [status, setStatus] = React.useState<'checking' | 'ready' | 'invalid'>('checking');

  React.useEffect(() => {
    const supabase = createClient();
    async function init() {
      // Link from the e-mail: #access_token=…&refresh_token=…&type=recovery
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hash.get('access_token');
      const refresh_token = hash.get('refresh_token');
      if (hash.get('error_code')) {
        setStatus('invalid');
        return;
      }
      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        // drop the tokens from the address bar and history
        window.history.replaceState(null, '', window.location.pathname);
        setStatus(sessionError ? 'invalid' : 'ready');
        return;
      }
      const { data } = await supabase.auth.getUser();
      setStatus(data.user ? 'ready' : 'invalid');
    }
    void init();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.');
    if (password !== confirm) return setError('As duas senhas não são iguais.');
    setPending(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setPending(false);
    if (updateError) {
      return setError(
        updateError.code === 'same_password'
          ? 'A nova senha precisa ser diferente da anterior.'
          : updateError.code === 'weak_password'
            ? 'Senha fraca. Misture letras, números e símbolos.'
            : 'Não foi possível salvar a nova senha. Peça um novo link e tente de novo.',
      );
    }
    toast.success('Senha alterada com sucesso.');
    router.replace('/admin');
    router.refresh();
  }

  if (status !== 'ready') {
    return (
      <main className="concrete-grain bg-brand-green-dark flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="shadow-lift w-full max-w-md rounded-2xl bg-white p-6 text-center sm:p-8">
          {status === 'checking' ? (
            <>
              <Loader2 className="text-brand-green mx-auto size-8 animate-spin" aria-hidden />
              <p className="text-muted mt-3" role="status">
                Validando o link…
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="text-danger mx-auto size-8" aria-hidden />
              <h1 className="font-heading text-brand-green mt-3 text-xl font-bold">
                Link inválido ou expirado
              </h1>
              <p className="text-muted mt-2">
                O link de recuperação vale por 1 hora e só pode ser usado uma vez. Peça um novo na
                tela de entrada.
              </p>
              <Button asChild variant="green" className="mt-5 w-full">
                <a href="/admin/login">Voltar para a entrada</a>
              </Button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="concrete-grain bg-brand-green-dark flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <Logo variant="white" className="h-20" />
        </div>
        <form
          onSubmit={onSubmit}
          noValidate
          className="shadow-lift rounded-2xl bg-white p-6 sm:p-8"
        >
          <h1 className="font-heading text-brand-green text-2xl font-bold">Criar nova senha</h1>
          <p className="text-muted mt-1">Escolha uma senha com pelo menos 8 caracteres.</p>
          {error ? (
            <p
              role="alert"
              className="border-danger/30 bg-danger/5 text-ink mt-5 flex items-start gap-2.5 rounded-[10px] border p-3.5 text-sm font-medium"
            >
              <AlertTriangle className="text-danger mt-0.5 size-5 shrink-0" aria-hidden />
              {error}
            </p>
          ) : null}
          <div className="mt-6 space-y-4">
            <Field label="Nova senha" htmlFor="nova-senha">
              <Input
                id="nova-senha"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Repita a nova senha" htmlFor="nova-senha-2">
              <Input
                id="nova-senha-2"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <Button type="submit" variant="green" size="lg" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <KeyRound aria-hidden />
              )}
              Salvar nova senha
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
