#!/usr/bin/env bash
# Aplica todas as migrations no Supabase de TESTE local (recria o schema public).
set -euo pipefail
cd "$(dirname "$0")"
source .env
export PGPASSWORD="$POSTGRES_PASSWORD"
PSQL="psql -h localhost -p 54322 -U postgres -d postgres -v ON_ERROR_STOP=1 -q"
$PSQL -c "drop schema if exists public cascade; create schema public; grant usage on schema public to anon, authenticated, service_role; grant all on schema public to postgres, service_role; alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant all on functions to anon, authenticated, service_role; alter default privileges in schema public grant all on sequences to anon, authenticated, service_role; drop trigger if exists on_auth_user_created on auth.users; delete from auth.users;"
for f in ../migrations/*.sql; do echo "→ $f"; $PSQL -f "$f"; done
# PostgREST relê o schema
$PSQL -c "notify pgrst, 'reload schema';"
echo "ok"
