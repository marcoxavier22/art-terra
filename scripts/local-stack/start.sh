#!/usr/bin/env bash
# Local, disposable Supabase-compatible stack for tests (Postgres + PostgREST + GoTrue + gateway).
# It applies supabase/migrations + supabase/seed.sql exactly as they will run in production.
#
# Requirements: PostgreSQL 15+ binaries, and the PostgREST / supabase-auth release binaries:
#   POSTGREST_BIN=/path/postgrest  GOTRUE_DIR=/path/with/auth+migrations  ./start.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATE="${STACK_DIR:-$ROOT/.local-stack}"
PG_BIN="${PG_BIN:-$(dirname "$(command -v initdb || echo /usr/lib/postgresql/16/bin/initdb)")}"
POSTGREST_BIN="${POSTGREST_BIN:?set POSTGREST_BIN}"
GOTRUE_DIR="${GOTRUE_DIR:?set GOTRUE_DIR}"
PG_PORT=54322
PG_USER_OS="${PG_OS_USER:-}"   # set when running as root (postgres refuses to run as root)
JWT_SECRET="local-test-secret-with-at-least-32-characters!!"
CONTACT_SECRET="local-contact-secret"
SITE="${SITE_URL:-http://localhost:3000}"

run_pg() { if [ -n "$PG_USER_OS" ]; then su "$PG_USER_OS" -s /bin/bash -c "$*"; else bash -c "$*"; fi; }
jwt() { node -e '
const c=require("crypto");const b=(o)=>Buffer.from(JSON.stringify(o)).toString("base64url");
const h=b({alg:"HS256",typ:"JWT"}),p=b({role:process.argv[1],iss:"supabase-local",iat:1700000000,exp:2000000000});
console.log(h+"."+p+"."+c.createHmac("sha256",process.argv[2]).update(h+"."+p).digest("base64url"))' "$1" "$JWT_SECRET"; }

"$ROOT/scripts/local-stack/stop.sh" >/dev/null 2>&1 || true
rm -rf "$STATE"; mkdir -p "$STATE/storage" "$STATE/logs"
[ -n "$PG_USER_OS" ] && chown -R "$PG_USER_OS" "$STATE"

run_pg "$PG_BIN/initdb -D $STATE/pg -U postgres --auth=trust -E UTF8 >/dev/null"
run_pg "$PG_BIN/pg_ctl -D $STATE/pg -o '-p $PG_PORT -c listen_addresses=127.0.0.1 -k $STATE' -l $STATE/logs/postgres.log -w start >/dev/null"
PSQL="psql -h 127.0.0.1 -p $PG_PORT -U postgres -v ON_ERROR_STOP=1 -q"
$PSQL -d postgres -f "$ROOT/scripts/local-stack/bootstrap.sql"

ANON_KEY="$(jwt anon)"; SERVICE_KEY="$(jwt service_role)"

# --- GoTrue (auth) ---
gotrue_env() { ( cd "$GOTRUE_DIR" && env \
  GOTRUE_DB_DRIVER=postgres \
  DATABASE_URL="postgres://supabase_auth_admin:postgres@127.0.0.1:$PG_PORT/postgres?sslmode=disable" \
  GOTRUE_DB_NAMESPACE=auth DB_NAMESPACE=auth API_EXTERNAL_URL="http://127.0.0.1:54321/auth/v1" \
  GOTRUE_API_HOST=127.0.0.1 PORT=54332 GOTRUE_SITE_URL="$SITE" GOTRUE_URI_ALLOW_LIST="$SITE/**" \
  GOTRUE_JWT_SECRET="$JWT_SECRET" GOTRUE_JWT_EXP=3600 GOTRUE_JWT_AUD=authenticated \
  GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated GOTRUE_JWT_ADMIN_ROLES=service_role \
  GOTRUE_DISABLE_SIGNUP=true GOTRUE_EXTERNAL_EMAIL_ENABLED=true GOTRUE_MAILER_AUTOCONFIRM=true \
  GOTRUE_RATE_LIMIT_EMAIL_SENT=1000 GOTRUE_SMTP_HOST=127.0.0.1 GOTRUE_SMTP_PORT=2500 \
  GOTRUE_SMTP_ADMIN_EMAIL=noreply@example.com \
  "$@" ); }
gotrue_env ./auth migrate >"$STATE/logs/gotrue-migrate.log" 2>&1
gotrue_env nohup ./auth serve >"$STATE/logs/gotrue.log" 2>&1 </dev/null &
echo $! >"$STATE/gotrue.pid"
for i in $(seq 1 60); do curl -sf http://127.0.0.1:54332/health >/dev/null && break; sleep 0.5; done
curl -sf http://127.0.0.1:54332/health >/dev/null || { echo "GoTrue failed"; tail -20 "$STATE/logs/gotrue.log"; exit 1; }

# --- schema + seed (same files used in production) ---
for f in "$ROOT"/supabase/migrations/*.sql; do $PSQL -d postgres -f "$f"; done
$PSQL -d postgres -f "$ROOT/supabase/seed.sql"
[ -f "$ROOT/supabase/seed-images.sql" ] && $PSQL -d postgres -f "$ROOT/supabase/seed-images.sql"
$PSQL -d postgres -c "insert into private.app_config (chave, valor) values ('contact_secret_sha256', encode(sha256(convert_to('$CONTACT_SECRET','UTF8')),'hex')) on conflict (chave) do update set valor = excluded.valor"

# --- PostgREST ---
PGRST_DB_URI="postgres://authenticator:postgres@127.0.0.1:$PG_PORT/postgres" PGRST_DB_SCHEMAS=public \
PGRST_DB_ANON_ROLE=anon PGRST_JWT_SECRET="$JWT_SECRET" PGRST_SERVER_HOST=127.0.0.1 PGRST_SERVER_PORT=54331 \
PGRST_DB_EXTRA_SEARCH_PATH=public,extensions \
nohup "$POSTGREST_BIN" >"$STATE/logs/postgrest.log" 2>&1 </dev/null & echo $! >"$STATE/postgrest.pid"

# --- gateway ---
STORAGE_DIR="$STATE/storage" ANON_KEY="$ANON_KEY" nohup node "$ROOT/scripts/local-stack/gateway.mjs" >"$STATE/logs/gateway.log" 2>&1 </dev/null & echo $! >"$STATE/gateway.pid"
for i in $(seq 1 40); do curl -sf "http://127.0.0.1:54321/rest/v1/categorias?select=slug" -H "apikey: $ANON_KEY" >/dev/null && break; sleep 0.5; done

# --- test users: one admin, one authenticated non-admin ---
mk_user() { curl -sf -X POST http://127.0.0.1:54321/auth/v1/admin/users -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H 'content-type: application/json' -d "{\"email\":\"$1\",\"password\":\"$2\",\"email_confirm\":true}" | node -pe 'JSON.parse(require("fs").readFileSync(0)).id'; }
ADMIN_ID="$(mk_user admin@artterra.test 'SenhaForte!123')"
mk_user visitante@artterra.test 'SenhaForte!123' >/dev/null
$PSQL -d postgres -c "insert into public.admin_users (user_id) values ('$ADMIN_ID')"

cat >"$STATE/env" <<ENV
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
NEXT_PUBLIC_SITE_URL=$SITE
NEXT_PUBLIC_WHATSAPP_NUMBER=5524992290708
CONTACT_FORM_SECRET=$CONTACT_SECRET
E2E_ADMIN_EMAIL=admin@artterra.test
E2E_ADMIN_PASSWORD=SenhaForte!123
E2E_USER_EMAIL=visitante@artterra.test
ENV
echo "Local stack ready. Env written to $STATE/env"
