'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertTriangle, CheckCircle2, Loader2, Send, ShieldCheck } from 'lucide-react';
import { CONTACT_SUBJECTS } from '@/lib/site';
import { maskPhoneBR } from '@/lib/text';
import { contactSchema, type ContactInput } from '@/lib/validation/contact';
import { contactMessage, whatsappUrl } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { WhatsAppIcon } from '@/components/ui/icons';

type Status = { kind: 'idle' } | { kind: 'success' } | { kind: 'error'; message: string };

export function ContactForm({ whatsapp }: { whatsapp: string }) {
  const [status, setStatus] = React.useState<Status>({ kind: 'idle' });
  const [sent, setSent] = React.useState<ContactInput | null>(null);
  const [honeypot, setHoneypot] = React.useState('');
  const openedAt = React.useRef(0);
  React.useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { nome: '', telefone: '', email: '', assunto: 'Orçamento', mensagem: '' },
  });

  async function onSubmit(values: ContactInput) {
    setStatus({ kind: 'idle' });
    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          website: honeypot,
          elapsed: Date.now() - openedAt.current,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: Partial<Record<keyof ContactInput, string>>;
      };
      if (response.ok && body.ok) {
        setSent(values);
        setStatus({ kind: 'success' });
        reset();
        openedAt.current = Date.now();
        return;
      }
      if (body.fieldErrors) {
        for (const [field, message] of Object.entries(body.fieldErrors)) {
          if (message) setError(field as keyof ContactInput, { message });
        }
      }
      setStatus({
        kind: 'error',
        message: body.error ?? 'Não foi possível enviar agora. Tente de novo em instantes.',
      });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Sem conexão com o servidor. Verifique sua internet e tente de novo.',
      });
    }
  }

  if (status.kind === 'success' && sent) {
    return (
      <div
        role="status"
        className="border-brand-green/20 shadow-soft rounded-[12px] border bg-white p-6 text-center sm:p-8"
      >
        <CheckCircle2 className="text-brand-green mx-auto size-12" aria-hidden />
        <h3 className="font-heading text-brand-green mt-4 text-xl font-bold">
          Mensagem enviada. Obrigado, {sent.nome.split(' ')[0]}!
        </h3>
        <p className="text-muted mt-2">
          Recebemos seu contato e vamos responder em breve. Quer agilizar? Continue a conversa pelo
          WhatsApp — sua mensagem já vai preenchida.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button asChild variant="whatsapp" size="lg">
            <a
              href={whatsappUrl(whatsapp, contactMessage(sent))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              Continuar no WhatsApp
            </a>
          </Button>
          <Button variant="ghost" onClick={() => setStatus({ kind: 'idle' })}>
            Enviar outra mensagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="border-line shadow-soft rounded-[12px] border bg-white p-5 sm:p-7"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Nome"
          htmlFor="contato-nome"
          error={errors.nome?.message}
          className="sm:col-span-2"
        >
          <Input
            id="contato-nome"
            autoComplete="name"
            aria-invalid={Boolean(errors.nome)}
            aria-describedby={errors.nome ? 'contato-nome-error' : undefined}
            {...register('nome')}
          />
        </Field>

        <Field
          label="Telefone / WhatsApp"
          htmlFor="contato-telefone"
          error={errors.telefone?.message}
        >
          <Input
            id="contato-telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(24) 99999-9999"
            aria-invalid={Boolean(errors.telefone)}
            aria-describedby={errors.telefone ? 'contato-telefone-error' : undefined}
            {...register('telefone', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setValue('telefone', maskPhoneBR(e.target.value)),
            })}
          />
        </Field>

        <Field label="E-mail" htmlFor="contato-email" optional error={errors.email?.message}>
          <Input
            id="contato-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contato-email-error' : undefined}
            {...register('email')}
          />
        </Field>

        <Field
          label="Assunto"
          htmlFor="contato-assunto"
          error={errors.assunto?.message}
          className="sm:col-span-2"
        >
          <Select
            id="contato-assunto"
            aria-invalid={Boolean(errors.assunto)}
            {...register('assunto')}
          >
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Mensagem"
          htmlFor="contato-mensagem"
          error={errors.mensagem?.message}
          hint="Se for orçamento, diga o produto, a medida e a quantidade ou a área em m²."
          className="sm:col-span-2"
        >
          <Textarea
            id="contato-mensagem"
            rows={5}
            maxLength={2000}
            aria-invalid={Boolean(errors.mensagem)}
            aria-describedby={errors.mensagem ? 'contato-mensagem-error' : 'contato-mensagem-hint'}
            {...register('mensagem')}
          />
        </Field>
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="contato-website">Não preencha este campo</label>
        <input
          id="contato-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {status.kind === 'error' ? (
        <div
          role="alert"
          className="border-danger/30 bg-danger/5 text-ink mt-5 flex flex-col gap-3 rounded-[10px] border p-4 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2.5">
            <AlertTriangle className="text-danger mt-0.5 size-5 shrink-0" aria-hidden />
            {status.message}
          </p>
          <Button asChild variant="whatsapp" size="sm" className="shrink-0">
            <a
              href={whatsappUrl(whatsapp, contactMessage(getValues()))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              Enviar pelo WhatsApp
            </a>
          </Button>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted flex items-start gap-2 text-sm">
          <ShieldCheck className="text-brand-green mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            Usaremos seus dados apenas para retornar seu contato.{' '}
            <a
              href="/privacidade"
              className="text-brand-green font-medium underline underline-offset-2"
            >
              Política de Privacidade
            </a>
          </span>
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting} className="shrink-0">
          {isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
          {isSubmitting ? 'Enviando…' : 'Enviar mensagem'}
        </Button>
      </div>
    </form>
  );
}
