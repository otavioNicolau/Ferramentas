#!/bin/bash

# Script de instalação otimizado para VPS
# Instala dependências de produção e desenvolvimento separadamente

echo "🚀 Iniciando instalação otimizada para VPS..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "📦 Limpando cache do npm..."
npm cache clean --force

echo "🔧 Configurando npm para VPS..."
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

echo "📋 Removendo node_modules e package-lock.json existentes..."
rm -rf node_modules
rm -f package-lock.json

echo "📦 Instalando dependências de produção..."
# Instalar apenas dependências de produção primeiro
npm install --only=production --no-audit --no-fund --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências de produção"
    echo "🔄 Tentando instalação alternativa..."
    npm install --only=production --force --no-audit --no-fund
    
    if [ $? -ne 0 ]; then
        echo "❌ Falha na instalação de dependências de produção"
        exit 1
    fi
fi

echo "🛠️ Instalando dependências de desenvolvimento..."
# Instalar dependências de desenvolvimento
npm install --only=development --no-audit --no-fund --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "⚠️ Erro ao instalar dependências de desenvolvimento"
    echo "🔄 Tentando instalação alternativa..."
    npm install --only=development --force --no-audit --no-fund
    
    if [ $? -ne 0 ]; then
        echo "⚠️ Algumas dependências de desenvolvimento falharam, mas continuando..."
        echo "📝 Tentando instalar dependências críticas individualmente..."
        
        # Instalar dependências críticas uma por uma
        critical_deps=("typescript" "@types/node" "@types/react" "@types/react-dom" "tailwindcss" "eslint")
        
        for dep in "${critical_deps[@]}"; do
            echo "📦 Instalando $dep..."
            npm install "$dep" --save-dev --no-audit --no-fund --legacy-peer-deps
        done
    fi
fi

echo "🔍 Verificando instalação..."
npm list --depth=0

echo "✅ Instalação concluída!"
echo "📊 Estatísticas:"
echo "   • Dependências de produção: $(npm list --only=production --depth=0 2>/dev/null | grep -c '├──\|└──')" 
echo "   • Dependências de desenvolvimento: $(npm list --only=development --depth=0 2>/dev/null | grep -c '├──\|└──')"
echo "   • Tamanho do node_modules: $(du -sh node_modules 2>/dev/null | cut -f1)"

echo "🚀 Para iniciar o servidor de desenvolvimento: npm run dev"
echo "🏗️ Para fazer build de produção: npm run build"
echo "▶️ Para iniciar em produção: npm start"