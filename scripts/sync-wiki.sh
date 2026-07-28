#!/usr/bin/env bash
# Sync docs/wiki → GitHub Wiki (sclinic.wiki.git)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/docs/wiki"
REPO_SSH="${SCLINIC_WIKI_SSH:-git@github.com:ViniciusSantos31/sclinic.wiki.git}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ ! -d "$SRC" ]]; then
  echo "error: missing $SRC" >&2
  exit 1
fi

echo "→ Cloning wiki: $REPO_SSH"
if ! git clone --depth 1 "$REPO_SSH" "$TMP/wiki" 2>/tmp/sclinic-wiki-clone.err; then
  cat /tmp/sclinic-wiki-clone.err >&2
  echo "" >&2
  echo "Wiki clone failed. Checklist:" >&2
  echo "  1) Enable Wikis: GitHub → Settings → Features → Wikis" >&2
  echo "  2) Create the first page in the UI (Home) if the wiki repo does not exist yet" >&2
  echo "  3) Ensure SSH access to github.com (ssh -T git@github.com)" >&2
  exit 1
fi

cd "$TMP/wiki"

shopt -s nullglob
for f in "$SRC"/*.md; do
  base="$(basename "$f")"
  if [[ "$base" == "README.md" ]]; then
    continue
  fi
  cp "$f" .
done

if [[ -f "$SRC/_Sidebar.md" ]]; then
  cp "$SRC/_Sidebar.md" .
fi

git add -A
if git diff --cached --quiet; then
  echo "✓ Wiki already up to date."
  exit 0
fi

git -c user.name="sclinic-docs" -c user.email="docs@sclinic.local" commit -m "docs(wiki): sync handbook from docs/wiki

Synced from repository docs/wiki source of truth."
git push origin HEAD

echo "✓ Wiki published: https://github.com/ViniciusSantos31/sclinic/wiki"
