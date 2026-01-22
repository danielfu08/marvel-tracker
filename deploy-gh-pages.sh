#!/bin/bash

# Deploy script for GitHub Pages
# Usage: ./deploy-gh-pages.sh

set -e

echo "🚀 Iniciando deploy a GitHub Pages..."

# Build the application
echo "📦 Compilando la aplicación..."
npm run build

# Create a temporary directory for the gh-pages branch
echo "📁 Preparando archivos para GitHub Pages..."
TEMP_DIR=$(mktemp -d)
cp -r dist/public/* "$TEMP_DIR/"

# Stash current changes
git stash

# Create or checkout gh-pages branch
if git rev-parse --verify gh-pages >/dev/null 2>&1; then
    echo "📝 Usando rama gh-pages existente..."
    git checkout gh-pages
    git pull origin gh-pages 2>/dev/null || true
else
    echo "✨ Creando nueva rama gh-pages..."
    git checkout --orphan gh-pages
fi

# Remove all files except .git
find . -maxdepth 1 -not -name '.git' -not -name '.' -exec rm -rf {} +

# Copy built files
cp -r "$TEMP_DIR"/* .

# Add and commit
git add -A
git commit -m "Deploy: $(date)" || echo "No changes to commit"

# Push to GitHub
echo "🌐 Subiendo a GitHub..."
git push -u origin gh-pages

# Return to main branch
git checkout main
git stash pop || true

# Cleanup
rm -rf "$TEMP_DIR"

echo "✅ ¡Deploy completado!"
echo "🎉 Tu sitio estará disponible en: https://danielfu08.github.io/marvel-tracker/"
echo ""
echo "Nota: Puede tomar unos minutos para que GitHub Pages procese los cambios."
