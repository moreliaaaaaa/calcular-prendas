#!/usr/bin/env bash
git filter-branch --force --tag-name-filter cat --tree-filter 'if [ -f src/config/supabase.js ]; then sed -i.bak "s/sb_publishable_nklNm8fdYbUrgCGfANrksQ_jFSWFvbO//g" src/config/supabase.js; rm -f src/config/supabase.js.bak; fi' -- --all
if [ $? -eq 0 ]; then git for-each-ref --format='%(refname)' refs/original/ | xargs -r git update-ref -d; rm -rf .git/refs/original/; git reflog expire --expire=now --all; git gc --prune=now --aggressive; fi
