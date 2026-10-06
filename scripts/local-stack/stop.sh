#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STATE="${STACK_DIR:-$ROOT/.local-stack}"
PG_BIN="${PG_BIN:-$(dirname "$(command -v pg_ctl || echo /usr/lib/postgresql/16/bin/pg_ctl)")}"
for name in gateway postgrest gotrue; do
  [ -f "$STATE/$name.pid" ] && kill "$(cat "$STATE/$name.pid")" 2>/dev/null
done
if [ -d "$STATE/pg" ]; then
  if [ -n "${PG_OS_USER:-}" ]; then su "$PG_OS_USER" -s /bin/bash -c "$PG_BIN/pg_ctl -D $STATE/pg -m fast stop" >/dev/null 2>&1
  else "$PG_BIN/pg_ctl" -D "$STATE/pg" -m fast stop >/dev/null 2>&1; fi
fi
exit 0
