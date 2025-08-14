@echo off
echo 📥 Atualizando código do repositório...
git pull
if %errorlevel% neq 0 exit /b %errorlevel%

echo 📦 Instalando dependências (incluindo dev)...
npm ci --include=dev
if %errorlevel% neq 0 exit /b %errorlevel%

echo 🏗  Fazendo build de produção...
npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

echo 🚀 Reiniciando PM2...
pm2 restart ferramentas
if %errorlevel% neq 0 exit /b %errorlevel%

pm2 save
if %errorlevel% neq 0 exit /b %errorlevel%

echo ✅ Atualização concluída!
pause