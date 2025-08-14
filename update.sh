#!/bin/bash
set -e

echo "📥 Atualizando código do repositório..."
git pull

echo "📦 Instalando dependências (incluindo dev)..."
npm ci --include=dev

echo "🏗  Fazendo build de produção..."
npm run build

echo "🚀 Reiniciando PM2..."
pm2 restart ferramentas
pm2 save

echo "✅ Atualização concluída!"