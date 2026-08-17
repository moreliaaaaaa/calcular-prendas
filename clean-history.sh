#!/usr/bin/env bash
set -euo pipefail

if [ -z "${OLD_SUPABASE_ANON_KEY:-}" ]; then
  echo "Error: define OLD_SUPABASE_ANON_KEY antes de ejecutar este script." >&2
  echo "Ejemplo: OLD_SUPABASE_ANON_KEY='valor_a_remover' ./clean-history.sh" >&2
  exit 1
fi

export OLD_SUPABASE_ANON_KEY

git filter-branch --force --tag-name-filter cat --tree-filter '
if [ -f src/config/supabase.js ]; then
  node -e "const fs = require(\"fs\"); const path = \"src/config/supabase.js\"; const key = process.env.OLD_SUPABASE_ANON_KEY; const source = fs.readFileSync(path, \"utf8\"); fs.writeFileSync(path, source.split(key).join(\"\"));"
fi
' -- --all

git for-each-ref --format="%(refname)" refs/original/ | xargs -r git update-ref -d
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
