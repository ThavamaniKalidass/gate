#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/../supabase-schema.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "Missing schema file: $SQL_FILE"
  exit 1
fi

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Please set SUPABASE_DB_URL to your Supabase Postgres connection string."
  exit 1
fi

echo "Applying Supabase schema from $SQL_FILE..."
psql "$SUPABASE_DB_URL" -f "$SQL_FILE"
echo "Supabase schema applied successfully."

if [ -n "${SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_KEY:-}" ]; then
  echo
  echo "Ready to configure Netlify environment variables:"
  echo "  netlify env:set SUPABASE_URL $SUPABASE_URL"
  echo "  netlify env:set SUPABASE_SERVICE_KEY $SUPABASE_SERVICE_KEY"
else
  echo
  echo "Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Netlify site settings before deployment."
fi
