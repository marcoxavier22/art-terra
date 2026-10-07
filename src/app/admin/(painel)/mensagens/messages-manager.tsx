'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Inbox, Mail, MailOpen, Phone, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';
import { withToast } from '@/lib/admin/use-action';
import { maskPhoneBR, toWhatsappDigits } from '@/lib/text';
import type { Mensagem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { whatsappUrl } from '@/lib/whatsapp';
import { deleteMensagem, setMensagemLida } from './actions';

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

export function MessagesManager({ initial }: { initial: Mensagem[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  React.useEffect(() => setItems(initial), [initial]);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<Mensagem | null>(null);
  const [pending, startTransition] = React.useTransition();

  const sorted = [...items].sort(
    (a, b) => Number(a.lida) - Number(b.lida) || b.created_at.localeCompare(a.created_at),
  );
  const unread = items.filter((m) => !m.lida).length;

  function mark(m: Mensagem, lida: boolean) {
    const before = items;
    setItems((list) => list.map((i) => (i.id === m.id ? { ...i, lida } : i)));
    startTransition(async () => {
      const result = await withToast(setMensagemLida(m.id, lida));
      if (!result.ok) setItems(before);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!toDelete) return;
    startTransition(async () => {
      const result = await withToast(deleteMensagem(toDelete.id));
      if (result.ok) setItems((list) => list.filter((i) => i.id !== toDelete.id));
      setToDelete(null);
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="border-line rounded-[12px] border border-dashed bg-white p-10 text-center">
        <Inbox className="text-muted mx-auto size-10" aria-hidden />
        <p className="font-heading text-brand-green mt-3 text-lg font-semibold">
          Nenhuma mensagem por enquanto
        </p>
        <p className="text-muted mt-1">
          Quando alguém preencher o formulário de contato do site, a mensagem aparece aqui.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted mb-3 text-sm font-medium" role="status">
        {unread === 0
          ? 'Todas as mensagens foram lidas.'
          : `${unread} ${unread === 1 ? 'mensagem não lida' : 'mensagens não lidas'}.`}
      </p>
      <ul className="space-y-3">
        {sorted.map((m) => {
          const open = openId === m.id;
          const digits = toWhatsappDigits(m.telefone);
          const firstName = m.nome.split(' ')[0];
          return (
            <li
              key={m.id}
              data-testid="mensagem"
              className={cn(
                'shadow-soft overflow-hidden rounded-[12px] border bg-white',
                m.lida ? 'border-line' : 'border-brand-orange border-l-[6px]',
              )}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => {
                  setOpenId(open ? null : m.id);
                  if (!open && !m.lida) mark(m, true);
                }}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                {m.lida ? (
                  <MailOpen className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                ) : (
                  <Mail className="text-brand-orange-ink mt-0.5 size-5 shrink-0" aria-hidden />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2.5">
                    <span
                      className={cn('font-heading text-ink', m.lida ? 'font-medium' : 'font-bold')}
                    >
                      {m.nome}
                    </span>
                    {!m.lida ? (
                      <span className="bg-brand-orange text-brand-green-dark rounded px-1.5 py-0.5 text-[0.7rem] font-bold uppercase">
                        nova
                      </span>
                    ) : null}
                    <span className="text-muted text-sm">
                      {dateFormat.format(new Date(m.created_at))}
                    </span>
                  </span>
                  <span className="text-brand-green mt-0.5 block text-sm font-semibold">
                    {m.assunto ?? 'Contato'}
                  </span>
                  {!open ? (
                    <span className="text-muted mt-1 line-clamp-2 block text-sm">{m.mensagem}</span>
                  ) : null}
                </span>
                <ChevronDown
                  className={cn(
                    'text-muted mt-1 size-5 shrink-0 transition-transform',
                    open && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>
              {open ? (
                <div className="border-line border-t p-4">
                  <p className="text-ink break-words whitespace-pre-wrap">{m.mensagem}</p>
                  <dl className="mt-4 grid gap-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">Telefone</dt>
                      <Phone className="text-muted size-4" aria-hidden />
                      <dd>
                        <a
                          href={`tel:+${digits ?? m.telefone}`}
                          className="font-semibold hover:underline"
                        >
                          {maskPhoneBR(m.telefone) || m.telefone}
                        </a>
                      </dd>
                    </div>
                    {m.email ? (
                      <div className="flex items-center gap-2">
                        <dt className="sr-only">E-mail</dt>
                        <Mail className="text-muted size-4" aria-hidden />
                        <dd className="min-w-0">
                          <a
                            href={`mailto:${m.email}`}
                            className="font-semibold break-all hover:underline"
                          >
                            {m.email}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {digits ? (
                      <Button asChild variant="whatsapp" className="w-full sm:w-auto">
                        <a
                          href={whatsappUrl(
                            digits,
                            `Olá, ${firstName}! Aqui é da Art Terra. Recebemos sua mensagem pelo site.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <WhatsAppIcon />
                          Responder no WhatsApp
                        </a>
                      </Button>
                    ) : null}
                    <Button variant="outline" disabled={pending} onClick={() => mark(m, !m.lida)}>
                      {m.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                    </Button>
                    <Button
                      variant="dangerOutline"
                      disabled={pending}
                      onClick={() => setToDelete(m)}
                      className="sm:ml-auto"
                    >
                      <Trash2 />
                      Excluir
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Excluir a mensagem de ${toDelete?.nome ?? ''}?`}
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir definitivamente"
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
