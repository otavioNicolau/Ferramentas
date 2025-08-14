#!/bin/bash
set -e

BRANCH=main
echo "📥 Resetando para a origem ($BRANCH)..."
git fetch origin
git reset --hard origin/$BRANCH
git clean -fd

echo "📦 Instalando dependências (incluindo dev)..."
npm ci --include=dev

echo "🧹 Limpando build antigo..."
rm -rf .next

echo "🏗  Build de produção..."
npm run build

echo "🚀 (Re)iniciando PM2..."
pm2 restart ferramentas || pm2 start "npm run start -- -p 3001" --name ferramentas
pm2 save

echo "✅ Atualização concluída!"
