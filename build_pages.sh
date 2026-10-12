#!/bin/bash
# ==============================================================================
# Cloudflare Pages / Workers Build Script for Shri Vangmayam
# Compiles clean static site into dist/ (keeping .git intact at root)
# ==============================================================================

set -e
echo "=== Cloudflare Build: Preparing clean distribution in dist/ ==="

# 1. Clean previous dist
rm -rf dist
mkdir -p dist

# 2. Copy core website files
cp index.html styles.css app.js dist/
[ -f .nojekyll ] && cp .nojekyll dist/

# 3. Copy content folders
cp -r data dist/
cp -r stuti_ganga dist/
cp -r vedant_darshanam dist/
cp -r ved_puraanam dist/

# 4. Filter out PDFs exceeding 24MB (served via Cloudflare R2)
echo "Filtering out PDFs exceeding 24MB limit from dist/..."
find dist -type f -name "*.pdf" -size +24M -print -delete

echo "Clean dist directory prepared successfully. Ready for deployment!"
