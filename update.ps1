# Script de atualização automatizada para Windows
# Execute com: .\update.ps1

Write-Host "📥 Atualizando código do repositório..." -ForegroundColor Green
git pull

Write-Host "📦 Instalando dependências (incluindo dev)..." -ForegroundColor Green
npm ci --include=dev

Write-Host "🏗  Fazendo build de produção..." -ForegroundColor Green
npm run build

Write-Host "🚀 Reiniciando PM2..." -ForegroundColor Green
pm2 restart ferramentas
pm2 save

Write-Host "✅ Atualização concluída!" -ForegroundColor Green