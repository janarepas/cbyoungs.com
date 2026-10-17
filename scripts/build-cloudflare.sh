#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist/static
cp static/index.html dist/index.html
cp static/style.css dist/static/style.css
cp static/*.svg dist/static/
cp static/*.webp dist/static/
printf 'ok\n' > dist/health
printf '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n\n/static/*\n  Cache-Control: public, max-age=3600\n' > dist/_headers
printf '404 — Az oldal nem található.\n' > dist/404.html

# Fail the deployment if the generated site is incomplete.
test -s dist/index.html
test -s dist/static/style.css
test -s dist/static/hero.webp
grep -q 'id="hero-title"' dist/index.html
grep -q 'cb09hun@gmail.com' dist/index.html
revision="$(git rev-parse --short HEAD)"
printf 'CB Youngs deployment: %s\n' "$revision" > dist/deployment.txt
printf '\nCB Youngs build verified (%s). Files ready for Cloudflare Pages:\n' "$revision"
find dist -type f -print
wc -c dist/index.html dist/static/style.css
