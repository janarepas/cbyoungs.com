#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist/static
cp static/index.html dist/index.html
cp static/style.css dist/static/style.css
cp static/*.webp dist/static/
printf 'ok\n' > dist/health
printf '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n\n/static/*\n  Cache-Control: public, max-age=3600\n' > dist/_headers
printf '404 — Az oldal nem található.\n' > dist/404.html
