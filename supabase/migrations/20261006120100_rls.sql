-- Art Terra — Row Level Security
-- Regras gerais:
--   * visitante (anon) só lê o que está ativo;
--   * admin (authenticated + linha em admin_users) lê e escreve tudo;
--   * policies separadas por papel e por comando evitam o alerta
--     "multiple permissive policies" e mantêm private.is_admin() fora do alcance do anon.

alter table public.admin_users enable row level security;
alter table public.categorias enable row level security;
alter table public.cores enable row level security;
alter table public.produtos enable row level security;
alter table public.produto_cores enable row level security;
alter table public.galeria enable row level security;
alter table public.configuracoes enable row level security;
alter table public.mensagens_contato enable row level security;

-- Privilégios de tabela (RLS decide as linhas; GRANT decide os comandos)
revoke all on all tables in schema public from anon, authenticated;
grant select on public.categorias, public.cores, public.produtos, public.produto_cores,
  public.galeria, public.configuracoes to anon, authenticated;
grant insert on public.mensagens_contato to anon, authenticated;
grant select on public.admin_users to authenticated;
grant insert, update, delete on public.categorias, public.cores, public.produtos,
  public.produto_cores, public.galeria to authenticated;
grant update on public.configuracoes to authenticated;
grant select, update, delete on public.mensagens_contato to authenticated;

-- ----------------------------- categorias ---------------------------------
create policy "categorias: leitura publica" on public.categorias
  for select to anon using (ativo);
create policy "categorias: leitura autenticado" on public.categorias
  for select to authenticated using (ativo or (select private.is_admin()));
create policy "categorias: admin insere" on public.categorias
  for insert to authenticated with check ((select private.is_admin()));
create policy "categorias: admin atualiza" on public.categorias
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "categorias: admin exclui" on public.categorias
  for delete to authenticated using ((select private.is_admin()));

-- ------------------------------ produtos -----------------------------------
create policy "produtos: leitura publica" on public.produtos
  for select to anon using (ativo);
create policy "produtos: leitura autenticado" on public.produtos
  for select to authenticated using (ativo or (select private.is_admin()));
create policy "produtos: admin insere" on public.produtos
  for insert to authenticated with check ((select private.is_admin()));
create policy "produtos: admin atualiza" on public.produtos
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "produtos: admin exclui" on public.produtos
  for delete to authenticated using ((select private.is_admin()));

-- -------------------------------- cores ------------------------------------
create policy "cores: leitura publica" on public.cores
  for select to anon, authenticated using (true);
create policy "cores: admin insere" on public.cores
  for insert to authenticated with check ((select private.is_admin()));
create policy "cores: admin atualiza" on public.cores
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "cores: admin exclui" on public.cores
  for delete to authenticated using ((select private.is_admin()));

-- ---------------------------- produto_cores --------------------------------
create policy "produto_cores: leitura publica" on public.produto_cores
  for select to anon, authenticated using (true);
create policy "produto_cores: admin insere" on public.produto_cores
  for insert to authenticated with check ((select private.is_admin()));
create policy "produto_cores: admin atualiza" on public.produto_cores
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "produto_cores: admin exclui" on public.produto_cores
  for delete to authenticated using ((select private.is_admin()));

-- ------------------------------- galeria -----------------------------------
create policy "galeria: leitura publica" on public.galeria
  for select to anon using (ativo);
create policy "galeria: leitura autenticado" on public.galeria
  for select to authenticated using (ativo or (select private.is_admin()));
create policy "galeria: admin insere" on public.galeria
  for insert to authenticated with check ((select private.is_admin()));
create policy "galeria: admin atualiza" on public.galeria
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "galeria: admin exclui" on public.galeria
  for delete to authenticated using ((select private.is_admin()));

-- ---------------------------- configuracoes --------------------------------
create policy "configuracoes: leitura publica" on public.configuracoes
  for select to anon, authenticated using (true);
create policy "configuracoes: admin atualiza" on public.configuracoes
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- --------------------------- mensagens_contato -----------------------------
-- Visitante só insere (e a inserção ainda passa pelo gatilho de segurança da
-- migração seguinte); apenas admin lê, marca como lida e exclui.
create policy "mensagens: visitante envia" on public.mensagens_contato
  for insert to anon, authenticated
  with check (lida = false and char_length(btrim(nome)) >= 2 and char_length(btrim(mensagem)) >= 5);
create policy "mensagens: admin le" on public.mensagens_contato
  for select to authenticated using ((select private.is_admin()));
create policy "mensagens: admin atualiza" on public.mensagens_contato
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "mensagens: admin exclui" on public.mensagens_contato
  for delete to authenticated using ((select private.is_admin()));

-- ------------------------------ admin_users --------------------------------
-- Cada admin enxerga apenas a própria linha; sem escrita pela API.
create policy "admin_users: ver a si mesmo" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));
