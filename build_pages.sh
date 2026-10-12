#!/bin/bash
# ==============================================================================
# Cloudflare Pages Build Script for Shri Vangmayam
# Removes assets larger than 24MB so Cloudflare Pages deployment succeeds.
# Large assets (>25MB) are served directly from Cloudflare R2:
# https://assets.prajapati.page/shri-vangamayam-assets/
# ==============================================================================

echo "=== Cloudflare Pages Pre-deployment Build ==="
echo "Filtering out PDFs exceeding 24MB limit (served via Cloudflare R2)..."

find . -type f -name "*.pdf" -size +24M -print -delete

echo "Large assets filtered successfully. Ready for Cloudflare Pages!"
