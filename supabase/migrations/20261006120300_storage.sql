-- Art Terra — Storage
-- Buckets públicos para leitura (URL pública); escrita somente por admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('produtos', 'produtos', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('documentos', 'documentos', true, 26214400, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- A leitura pública acontece pela URL pública do bucket (não exige policy de SELECT).
-- O SELECT abaixo existe apenas para o admin poder substituir/excluir arquivos, o que
-- também impede que visitantes listem o conteúdo dos buckets.
create policy "storage art-terra: admin le" on storage.objects
  for select to authenticated
  using (bucket_id in ('produtos', 'documentos') and (select private.is_admin()));
create policy "storage art-terra: admin envia" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('produtos', 'documentos') and (select private.is_admin()));
create policy "storage art-terra: admin atualiza" on storage.objects
  for update to authenticated
  using (bucket_id in ('produtos', 'documentos') and (select private.is_admin()))
  with check (bucket_id in ('produtos', 'documentos') and (select private.is_admin()));
create policy "storage art-terra: admin exclui" on storage.objects
  for delete to authenticated
  using (bucket_id in ('produtos', 'documentos') and (select private.is_admin()));
