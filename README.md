# Art Terra — site, catálogo digital e painel

Site institucional da **Art Terra** (Pisos · Vasos · Revestimentos, Pinheiral/RJ) com catálogo
público navegável e painel administrativo para o cliente gerenciar produtos, categorias, cores,
galeria, configurações e mensagens — sem novo deploy a cada alteração.

## Stack

| Camada      | Tecnologia                                                                           |
| ----------- | ------------------------------------------------------------------------------------ |
| Framework   | Next.js 15 (App Router), React 19, TypeScript estrito                                |
| Estilo      | Tailwind CSS 4, componentes no padrão shadcn/ui (Radix), `lucide-react`              |
| Fontes      | Poppins, Inter e Bebas Neue via `next/font` (arquivos locais, sem chamada ao Google) |
| Dados       | Supabase: Postgres + Auth + Storage + RLS (`@supabase/ssr`)                          |
| Formulários | `react-hook-form` + `zod` (validação no cliente **e** no servidor)                   |
| Ordenação   | `@dnd-kit` (arrastar no desktop, setas no celular)                                   |
| Hospedagem  | Vercel (+ Analytics e Speed Insights)                                                |
| Testes      | Vitest (unitários) e Playwright (ponta a ponta)                                      |

## Estrutura

```
src/app/(site)        páginas públicas: /, /sobre, /contato, /catalogo, /catalogo/[categoria]/[slug], /privacidade
src/app/admin         login, recuperação de senha e painel (/admin/...)
src/app/api/contato   rota que grava as mensagens do formulário
src/components        site/, catalog/, admin/ e ui/
src/lib               dados com cache por tag, validações zod, utilitários, clientes Supabase
supabase/migrations   esquema, RLS, proteção do formulário e storage
supabase/seed.sql     4 categorias, 14 cores, 35 produtos, galeria (idempotente)
supabase/seed-images.sql  vincula as fotos extraídas do Catálogo 2025
scripts/              envio de imagens ao Storage, extração do PDF, stack local de testes
tests/                unit/ (Vitest) e e2e/ (Playwright)
```

## Rodando localmente

Requisitos: Node 20+ e pnpm.

```bash
pnpm install
cp .env.example .env.local   # preencha as variáveis (abaixo)
pnpm dev                     # http://localhost:3000
```

Scripts: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, `pnpm format`.

## Variáveis de ambiente

| Variável                        | Onde                  | Descrição                                                          |
| ------------------------------- | --------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | cliente + servidor    | URL do projeto Supabase                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente + servidor    | chave pública (_publishable_ ou _anon_)                            |
| `NEXT_PUBLIC_SITE_URL`          | cliente + servidor    | URL final do site, sem barra no fim                                |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`   | cliente + servidor    | WhatsApp de reserva (`5524992290708`) se o banco falhar            |
| `CONTACT_FORM_SECRET`           | **só servidor**       | segredo do formulário de contato (ver abaixo)                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | **só na sua máquina** | usada apenas por `pnpm seed:images`; não precisa existir na Vercel |

O site **não usa a `service_role` em produção**: todo acesso passa pelas policies de RLS.
Nenhum arquivo `.env*` vai para o git (apenas o `.env.example`).

## Banco de dados (Supabase)

### 1. Migrações e seed

Com o MCP ou a CLI do Supabase, aplique os arquivos de `supabase/migrations/` em ordem, depois
`supabase/seed.sql` e `supabase/seed-images.sql`. Sem CLI: cole cada arquivo, na mesma ordem, no
**SQL Editor** do painel do Supabase e execute. O seed pode ser reexecutado sem duplicar nada.

### 2. Segredo do formulário de contato

A rota `/api/contato` envia o cabeçalho `x-contact-secret`; um gatilho no banco só aceita a
mensagem se o SHA-256 desse valor conferir, e aplica o limite de 3 envios a cada 10 minutos por IP.
Assim ninguém grava mensagens chamando a API do Supabase diretamente.

```bash
openssl rand -hex 32          # gere o segredo e guarde em CONTACT_FORM_SECRET (Vercel e .env.local)
```

```sql
-- no SQL Editor, trocando <SEGREDO> pelo valor gerado acima
insert into private.app_config (chave, valor)
values ('contact_secret_sha256', encode(sha256(convert_to('<SEGREDO>', 'UTF8')), 'hex'))
on conflict (chave) do update set valor = excluded.valor, updated_at = now();
```

### 3. Usuário administrador

1. **Authentication → Sign In / Providers → Email**: desative _Allow new users to sign up_.
2. **Authentication → Users → Add user**: informe o e-mail do cliente, marque _Auto Confirm User_ e
   defina uma senha provisória (o cliente troca por "Esqueci minha senha").
3. Copie o **User UID** e rode no SQL Editor:

```sql
insert into public.admin_users (user_id) values ('<UUID_DO_USUARIO>');
```

Quem está autenticado mas não está em `admin_users` é barrado no middleware, nas páginas, nas
Server Actions e nas policies do banco.

### 4. URLs de autenticação

Em **Authentication → URL Configuration**:

- _Site URL_: `https://SEU-DOMINIO`
- _Redirect URLs_: `https://SEU-DOMINIO/admin/auth/callback` e, para previews,
  `https://*-SEU-TIME.vercel.app/admin/auth/callback`

Sem isso, o link de "Esqueci minha senha" não volta para o site.

### 5. Imagens

As fotos do Catálogo 2025 já acompanham o projeto em `public/seed-images` e funcionam assim que o
seed é aplicado. Para movê-las ao Supabase Storage (opcional):

```bash
# .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
pnpm seed:images
```

Fotos enviadas pelo painel vão sempre para o bucket `produtos` (máx. 5 MB; JPG, PNG, WebP, AVIF),
já reduzidas no navegador para 1600 px em WebP. O PDF do catálogo vai para `documentos` (máx. 25 MB).

## Como o site se atualiza

As páginas públicas usam cache por tag (`products`, `categories`, `settings`, `gallery`). Toda ação
do painel chama `revalidateTag`/`revalidatePath`, então a alteração aparece em segundos, sem deploy.

## Testes

```bash
pnpm test        # utilitários: slug, mensagem de WhatsApp, calculadora, validações
pnpm test:e2e    # rotas públicas (desktop e celular) e fluxo login → criar produto → catálogo
```

Os testes e2e precisam do app apontando para um banco com o seed e um admin de teste
(`E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_USER_EMAIL` no `.env.local`). Para não tocar no
banco real, `scripts/local-stack/start.sh` sobe uma stack descartável (Postgres + PostgREST +
Supabase Auth) com as mesmas migrações e grava um `.env` pronto; os requisitos estão no cabeçalho
do script.

## Deploy na Vercel

1. Suba o repositório para o GitHub e importe em **vercel.com/new** (framework Next.js, Node 20+).
2. Em **Settings → Environment Variables**, cadastre as variáveis da tabela acima em Production,
   Preview e Development (`SUPABASE_SERVICE_ROLE_KEY` não é necessária).
3. Em **Settings → Functions**, escolha a região **São Paulo (gru1)**.
4. Habilite **Analytics** e **Speed Insights** no painel do projeto.
5. Faça o deploy e ajuste as URLs do passo "URLs de autenticação".

Os cabeçalhos de segurança (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, HSTS)
ficam em `next.config.ts`; não é preciso `vercel.json`.

### Domínio próprio

1. Vercel → **Settings → Domains → Add** → `artterra.com.br` (e `www.artterra.com.br`).
2. No provedor do domínio (ex.: Registro.br), crie os registros que a Vercel mostrar — em geral
   `A @ 76.76.21.21` e `CNAME www cname.vercel-dns.com`.
3. Quando o domínio ficar "Valid", atualize `NEXT_PUBLIC_SITE_URL`, faça um novo deploy e troque a
   _Site URL_ e as _Redirect URLs_ no Supabase.

## Segurança

- RLS em todas as tabelas; visitante só lê o que está ativo; escrita só para admin.
- Sessão e `is_admin` verificados no middleware **e** em cada página/Server Action do painel.
- Validação zod no servidor; URLs de imagem só são aceitas se vierem do nosso bucket.
- Formulário de contato com honeypot, tempo mínimo, limite por IP (IP guardado apenas como hash) e
  sanitização; nada do conteúdo das mensagens é registrado em log.
- `/admin` fora do `robots.txt`/sitemap e com `noindex`.
