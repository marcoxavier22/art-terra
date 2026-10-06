-- Art Terra — proteção do formulário de contato
--
-- A rota /api/contato (servidor Next.js) envia o cabeçalho `x-contact-secret`.
-- O gatilho abaixo só aceita inserções vindas da API quando o SHA-256 desse
-- cabeçalho confere com o valor guardado em private.app_config, e aplica o limite
-- de 3 envios a cada 10 minutos por IP. Assim ninguém consegue gravar mensagens
-- chamando a API do Supabase diretamente, e não precisamos da service_role.

create table private.app_config (
  chave text primary key,
  valor text not null,
  updated_at timestamptz not null default now()
);
alter table private.app_config enable row level security; -- sem policies: inacessível pela API

create or replace function private.guard_mensagem_contato()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claims text := coalesce(current_setting('request.jwt.claims', true), '');
  v_headers json;
  v_secret text;
  v_expected text;
  v_count int;
begin
  -- Conexão direta ao banco (SQL Editor, migrações): sem contexto de API, libera.
  if v_claims = '' then
    return new;
  end if;

  v_headers := nullif(current_setting('request.headers', true), '')::json;
  v_secret := v_headers ->> 'x-contact-secret';
  select valor into v_expected from private.app_config where chave = 'contact_secret_sha256';

  if v_expected is null or v_secret is null
     or encode(sha256(convert_to(v_secret, 'UTF8')), 'hex') <> v_expected then
    raise exception 'contato_nao_autorizado' using errcode = '42501';
  end if;

  new.id := gen_random_uuid();
  new.lida := false;
  new.created_at := now();

  if new.ip_hash is not null then
    select count(*) into v_count
      from public.mensagens_contato
     where ip_hash = new.ip_hash
       and created_at > now() - interval '10 minutes';
    if v_count >= 3 then
      raise exception 'contato_limite_excedido' using errcode = 'P0001';
    end if;
  end if;

  return new;
end
$$;
revoke all on function private.guard_mensagem_contato() from public;

create trigger t_mensagens_guard before insert on public.mensagens_contato
  for each row execute function private.guard_mensagem_contato();
