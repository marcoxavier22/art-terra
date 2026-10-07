import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Eye, EyeOff, Mail, Package, Plus, Star } from 'lucide-react';
import { Card, PageTitle } from '@/components/admin/page-title';
import { Button } from '@/components/ui/button';
import { requireAdminPage } from '@/lib/admin/auth';
import { BLUR_DATA_URL } from '@/lib/site';

export const metadata: Metadata = { title: 'Início' };

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

export default async function DashboardPage() {
  const { supabase } = await requireAdminPage();
  const [produtosRes, categoriasRes, unreadRes, recentRes] = await Promise.all([
    supabase.from('produtos').select('id, categoria_id, ativo, destaque'),
    supabase.from('categorias').select('id, nome, ativo, ordem').order('ordem'),
    supabase
      .from('mensagens_contato')
      .select('id', { count: 'exact', head: true })
      .eq('lida', false),
    supabase
      .from('produtos')
      .select('id, nome, ativo, imagem_principal_url, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);
  const produtos = produtosRes.data ?? [];
  const categorias = categoriasRes.data ?? [];
  const ativos = produtos.filter((p) => p.ativo).length;
  const inativos = produtos.length - ativos;
  const destaques = produtos.filter((p) => p.destaque && p.ativo).length;
  const unread = unreadRes.count ?? 0;

  const stats = [
    { label: 'Produtos no site', value: ativos, icon: Eye, href: '/admin/produtos?status=ativos' },
    {
      label: 'Produtos desativados',
      value: inativos,
      icon: EyeOff,
      href: '/admin/produtos?status=inativos',
    },
    { label: 'Em destaque na home', value: destaques, icon: Star, href: '/admin/produtos' },
    {
      label: 'Mensagens não lidas',
      value: unread,
      icon: Mail,
      href: '/admin/mensagens',
      highlight: unread > 0,
    },
  ];

  return (
    <>
      <PageTitle
        title="Olá! O que vamos fazer hoje?"
        description="Resumo do site e atalhos rápidos."
      >
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus />
            Novo produto
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            Ver site
          </a>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/mensagens">
            <Mail />
            Ver mensagens
          </Link>
        </Button>
      </PageTitle>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map(({ label, value, icon: Icon, href, highlight }) => (
          <li key={label}>
            <Link
              href={href}
              className={`shadow-soft flex h-full flex-col rounded-[12px] border p-4 transition-colors sm:p-5 ${
                highlight
                  ? 'border-brand-orange bg-brand-orange/10 hover:bg-brand-orange/15'
                  : 'border-line hover:border-brand-green/40 bg-white'
              }`}
            >
              <Icon className="text-brand-orange-ink size-6" aria-hidden />
              <span className="font-heading text-brand-green mt-3 text-3xl font-bold tabular-nums">
                {value}
              </span>
              <span className="text-muted mt-0.5 text-sm font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Produtos por categoria">
          <ul className="divide-line divide-y">
            {categorias.map((c) => {
              const total = produtos.filter((p) => p.categoria_id === c.id).length;
              const visiveis = produtos.filter((p) => p.categoria_id === c.id && p.ativo).length;
              return (
                <li key={c.id}>
                  <Link
                    href={`/admin/produtos?categoria=${c.id}`}
                    className="hover:text-brand-green flex min-h-12 items-center justify-between gap-3 py-2"
                  >
                    <span className="flex items-center gap-2.5 font-medium">
                      <Package className="text-muted size-4" aria-hidden />
                      {c.nome}
                      {!c.ativo ? (
                        <span className="bg-sand text-muted rounded px-1.5 py-0.5 text-xs font-semibold">
                          desativada
                        </span>
                      ) : null}
                    </span>
                    <span className="text-muted text-sm tabular-nums">
                      {visiveis} no site
                      {total !== visiveis ? ` · ${total - visiveis} desativados` : ''}
                    </span>
                  </Link>
                </li>
              );
            })}
            {categorias.length === 0 ? (
              <li className="text-muted py-3">Nenhuma categoria cadastrada ainda.</li>
            ) : null}
          </ul>
        </Card>

        <Card title="Últimas edições">
          <ul className="divide-line divide-y">
            {(recentRes.data ?? []).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="hover:text-brand-green flex min-h-14 items-center gap-3 py-2"
                >
                  <span className="bg-sand relative size-11 shrink-0 overflow-hidden rounded-lg">
                    {p.imagem_principal_url ? (
                      <Image
                        src={p.imagem_principal_url}
                        alt=""
                        fill
                        sizes="44px"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.nome}</span>
                    <span className="text-muted text-sm">
                      {dateFormat.format(new Date(p.updated_at))}
                      {!p.ativo ? ' · desativado' : ''}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            {(recentRes.data ?? []).length === 0 ? (
              <li className="text-muted py-3">Nenhum produto cadastrado ainda.</li>
            ) : null}
          </ul>
        </Card>
      </div>
    </>
  );
}
