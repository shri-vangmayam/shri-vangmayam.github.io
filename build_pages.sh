#!/bin/bash
# ==============================================================================
# Cloudflare Pages / Workers Build Script for Shri Vangmayam
# 1. Removes .git directory so Wrangler does not scan 1GB pack history file
# 2. Removes PDFs exceeding 24MB (served via Cloudflare R2)
# ==============================================================================

echo "=== Cloudflare Pre-deployment Build ==="

echo "1. Removing .git and internal directories from deployment output..."
rm -rf .git .karya_pranali .agents

echo "2. Filtering out PDFs exceeding 24MB limit (served via Cloudflare R2)..."
find . -type f -name "*.pdf" -size +24M -print -delete

echo "Clean build completed successfully. Ready for deployment!"
