#!/usr/bin/env bash
# Transfiere km21/empresas-foundation-ae8e (NominaCO-Pro) → NominappEmpresas main.
set -euo pipefail
SRC_REMOTE="${SRC_REMOTE:-https://github.com/K4MIKAZ3/NominaCO-Pro.git}"
DST_REMOTE="${DST_REMOTE:-https://github.com/K4MIKAZ3/NominappEmpresas.git}"
BRANCH="${BRANCH:-km21/empresas-foundation-ae8e}"

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

git clone --branch "$BRANCH" --single-branch "$SRC_REMOTE" "$tmpdir/src"
cd "$tmpdir/src"
git remote add empresas "$DST_REMOTE"
git push --force empresas "HEAD:main"
echo "OK: NominappEmpresas main ← $BRANCH"
echo "Redeploy el proyecto Vercel (Root Directory: apps/web)."
