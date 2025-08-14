# Script de instalação otimizado para VPS Windows
# Instala dependências de produção e desenvolvimento separadamente

Write-Host "🚀 Iniciando instalação otimizada para VPS Windows..." -ForegroundColor Green

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado. Por favor, instale o npm primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "🔧 Configurando npm para VPS..." -ForegroundColor Yellow
# Configurações otimizadas para VPS
npm config set registry https://registry.npmjs.org/
npm config set fund false
npm config set audit false
npm config set progress false
npm config set loglevel error

# Aumentar timeout para conexões lentas
npm config set timeout 300000
npm config set fetch-timeout 300000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

Write-Host "📋 Removendo node_modules e package-lock.json existentes..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

Write-Host "📦 Instalando dependências de produção..." -ForegroundColor Cyan
# Instalar apenas dependências de produção primeiro
$prodInstall = Start-Process -FilePath "npm" -ArgumentList "install", "--only=production", "--no-audit", "--no-fund", "--legacy-peer-deps" -Wait -PassThru -NoNewWindow

if ($prodInstall.ExitCode -ne 0) {
    Write-Host "❌ Erro ao instalar dependências de produção" -ForegroundColor Red
    Write-Host "🔄 Tentando instalação alternativa..." -ForegroundColor Yellow
    
    $prodInstallForce = Start-Process -FilePath "npm" -ArgumentList "install", "--only=production", "--force", "--no-audit", "--no-fund" -Wait -PassThru -NoNewWindow
    
    if ($prodInstallForce.ExitCode -ne 0) {
        Write-Host "❌ Falha na instalação de dependências de produção" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🛠️ Instalando dependências de desenvolvimento..." -ForegroundColor Cyan
# Instalar dependências de desenvolvimento
$devInstall = Start-Process -FilePath "npm" -ArgumentList "install", "--only=development", "--no-audit", "--no-fund", "--legacy-peer-deps" -Wait -PassThru -NoNewWindow

if ($devInstall.ExitCode -ne 0) {
    Write-Host "⚠️ Erro ao instalar dependências de desenvolvimento" -ForegroundColor Yellow
    Write-Host "🔄 Tentando instalação alternativa..." -ForegroundColor Yellow
    
    $devInstallForce = Start-Process -FilePath "npm" -ArgumentList "install", "--only=development", "--force", "--no-audit", "--no-fund" -Wait -PassThru -NoNewWindow
    
    if ($devInstallForce.ExitCode -ne 0) {
        Write-Host "⚠️ Algumas dependências de desenvolvimento falharam, mas continuando..." -ForegroundColor Yellow
        Write-Host "📝 Tentando instalar dependências críticas individualmente..." -ForegroundColor Yellow
        
        # Instalar dependências críticas uma por uma
        $criticalDeps = @("typescript", "@types/node", "@types/react", "@types/react-dom", "tailwindcss", "eslint")
        
        foreach ($dep in $criticalDeps) {
            Write-Host "📦 Instalando $dep..." -ForegroundColor Cyan
            Start-Process -FilePath "npm" -ArgumentList "install", "$dep", "--save-dev", "--no-audit", "--no-fund", "--legacy-peer-deps" -Wait -NoNewWindow
        }
    }
}

Write-Host "🔍 Verificando instalação..." -ForegroundColor Yellow
npm list --depth=0

Write-Host "✅ Instalação concluída!" -ForegroundColor Green
Write-Host "📊 Estatísticas:" -ForegroundColor Cyan

# Contar dependências
try {
    $prodCount = (npm list --only=production --depth=0 2>$null | Select-String "├──|└──").Count
    $devCount = (npm list --only=development --depth=0 2>$null | Select-String "├──|└──").Count
    
    Write-Host "   • Dependências de produção: $prodCount" -ForegroundColor White
    Write-Host "   • Dependências de desenvolvimento: $devCount" -ForegroundColor White
    
    if (Test-Path "node_modules") {
        $size = (Get-ChildItem "node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   • Tamanho do node_modules: $([math]::Round($size, 2)) MB" -ForegroundColor White
    }
} catch {
    Write-Host "   • Não foi possível calcular estatísticas" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Para iniciar o servidor de desenvolvimento: npm run dev" -ForegroundColor Green
Write-Host "🏗️ Para fazer build de produção: npm run build" -ForegroundColor Green
Write-Host "▶️ Para iniciar em produção: npm start" -ForegroundColor Green