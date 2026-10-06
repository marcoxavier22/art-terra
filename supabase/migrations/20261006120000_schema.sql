-- Art Terra — esquema principal
-- Extensões ficam no schema `extensions` (recomendação do Supabase Advisor).
create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- Schema privado: não é exposto pela API (PostgREST), então funções SECURITY DEFINER
-- aqui não podem ser chamadas diretamente por visitantes.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Admins (quem pode editar)
-- ---------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table public.admin_users is
  'Usuários com acesso ao painel. Inserção manual pelo SQL Editor.';

-- Equivalente ao public.is_admin() da especificação, movido para o schema privado
-- para não virar um endpoint RPC público.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------------
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text not null check (char_length(nome) between 1 and 80),
  descricao text,
  imagem_capa_url text,
  ordem int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Cores / acabamentos
-- ---------------------------------------------------------------------------
create table public.cores (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (char_length(nome) between 1 and 40),
  hex text not null default '#CCCCCC' check (hex ~* '^#[0-9a-f]{6}$'),
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Produtos
-- ---------------------------------------------------------------------------
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text not null check (char_length(nome) between 1 and 120),
  descricao text,
  -- [{ "rotulo": "Peça reta", "valor": "35x50" }, { "rotulo": null, "valor": "39x39x07" }]
  medidas jsonb not null default '[]' check (jsonb_typeof(medidas) = 'array'),
  rendimento text,                               -- texto exibido: "07 pç/m²"
  rendimento_pecas_m2 numeric check (rendimento_pecas_m2 is null or rendimento_pecas_m2 > 0),
  face text check (face in ('uma_face', 'dupla_face', 'uma_ou_dupla')),
  observacao_face text,                          -- ex.: "com ou sem floreira"
  aplicacao text,                                -- "Áreas externas, calçadas e garagens"
  observacoes text,
  imagem_principal_url text,
  imagem_aplicacao_url text,
  imagens_extras jsonb not null default '[]' check (jsonb_typeof(imagens_extras) = 'array'),
  destaque boolean not null default false,
  ativo boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index produtos_categoria_ordem_idx on public.produtos (categoria_id, ordem);
create index produtos_nome_trgm_idx on public.produtos using gin (nome extensions.gin_trgm_ops);

create table public.produto_cores (
  produto_id uuid not null references public.produtos(id) on delete cascade,
  cor_id uuid not null references public.cores(id) on delete restrict,
  ordem int not null default 0,
  primary key (produto_id, cor_id)
);
create index produto_cores_cor_id_idx on public.produto_cores (cor_id);

-- ---------------------------------------------------------------------------
-- Galeria "Projetos realizados"
-- ---------------------------------------------------------------------------
create table public.galeria (
  id uuid primary key default gen_random_uuid(),
  imagem_url text not null,
  legenda text,
  alt text not null check (char_length(alt) between 1 and 200),
  ordem int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Configurações do site (linha única)
-- ---------------------------------------------------------------------------
create table public.configuracoes (
  id int primary key default 1 check (id = 1),
  nome_empresa text not null default 'Art Terra',
  slogan text default 'Pisos · Vasos · Revestimentos',
  whatsapp text not null default '5524992290708' check (whatsapp ~ '^55[0-9]{10,11}$'),
  email text default 'contatoartterra@gmail.com',
  instagram text default 'artterraoficial',
  endereco text default 'Estrada Benjamin Constant, 4805, Mutirão (Km 5), Pinheiral/RJ',
  horario_atendimento text,
  catalogo_pdf_url text,
  hero_titulo text default 'Elegância atemporal em concreto',
  hero_subtitulo text,
  hero_imagem_url text,
  updated_at timestamptz not null default now()
);
insert into public.configuracoes (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Mensagens do formulário de contato
-- ---------------------------------------------------------------------------
create table public.mensagens_contato (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  telefone text not null check (char_length(telefone) between 8 and 30),
  email text check (email is null or char_length(email) <= 160),
  assunto text check (assunto is null or char_length(assunto) <= 60),
  mensagem text not null check (char_length(mensagem) between 5 and 2000),
  lida boolean not null default false,
  -- hash irreversível do IP (com segredo do servidor), usado só para limitar envios
  ip_hash text check (ip_hash is null or char_length(ip_hash) <= 64),
  created_at timestamptz not null default now()
);
create index mensagens_contato_created_idx on public.mensagens_contato (created_at desc);
create index mensagens_contato_ip_idx on public.mensagens_contato (ip_hash, created_at desc)
  where ip_hash is not null;

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger t_categorias_upd before update on public.categorias
  for each row execute function private.set_updated_at();
create trigger t_produtos_upd before update on public.produtos
  for each row execute function private.set_updated_at();
create trigger t_config_upd before update on public.configuracoes
  for each row execute function private.set_updated_at();
