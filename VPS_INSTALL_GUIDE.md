# 🚀 Guia de Instalação para VPS

## Problema: Dev Dependencies não instalam na VPS

Este guia resolve problemas comuns de instalação de dependências de desenvolvimento em servidores VPS.

## 🔧 Soluções Rápidas

### 1. Script Automatizado (Recomendado)

**Para Linux/Ubuntu VPS:**
```bash
chmod +x install-vps.sh
./install-vps.sh
```

**Para Windows VPS:**
```powershell
PowerShell -ExecutionPolicy Bypass -File install-vps.ps1
```

### 2. Configuração Manual

#### Passo 1: Configurar npm para VPS
```bash
# Copiar configuração otimizada
cp .npmrc-vps .npmrc

# Ou configurar manualmente
npm config set registry https://registry.npmjs.org/
npm config set timeout 300000
npm config set legacy-peer-deps true
npm config set fund false
npm config set audit false
```

#### Passo 2: Limpar cache e reinstalar
```bash
# Limpar tudo
npm cache clean --force
rm -rf node_modules package-lock.json

# Instalar produção primeiro
npm install --only=production --no-audit --no-fund

# Depois desenvolvimento
npm install --only=development --no-audit --no-fund
```

## 🐛 Problemas Comuns e Soluções

### Erro: "ENOTFOUND registry.npmjs.org"
```bash
# Verificar conectividade
ping registry.npmjs.org

# Configurar DNS alternativo
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf
```

### Erro: "EACCES: permission denied"
```bash
# Configurar diretório npm global
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Ou usar sudo (não recomendado)
sudo npm install --unsafe-perm
```

### Erro: "gyp ERR! stack Error: EACCES"
```bash
# Instalar ferramentas de build
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential python3

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3

# Alpine
sudo apk add build-base python3
```

### Erro: "Maximum call stack size exceeded"
```bash
# Aumentar limite de memória
export NODE_OPTIONS="--max-old-space-size=4096"
npm install
```

### Erro: Timeout durante instalação
```bash
# Aumentar timeouts
npm config set timeout 600000
npm config set fetch-timeout 600000
npm install --verbose
```

## 🔍 Instalação Seletiva de Dev Dependencies

Se algumas dependências continuam falhando, instale apenas as críticas:

```bash
# Dependências TypeScript essenciais
npm install --save-dev typescript @types/node @types/react @types/react-dom

# Tailwind CSS
npm install --save-dev tailwindcss @tailwindcss/postcss

# ESLint
npm install --save-dev eslint eslint-config-next

# Outras dependências específicas
npm install --save-dev @types/file-saver @types/fluent-ffmpeg @types/fs-extra
```

## 🚀 Alternativas para Build

### Build sem Dev Dependencies
Se as dev dependencies não instalarem, você ainda pode fazer build:

```bash
# Instalar apenas produção
npm install --only=production

# Build com dependências mínimas
npm run build --verbose
```

### Build Local + Deploy
```bash
# No ambiente local
npm run build

# Copiar apenas arquivos necessários para VPS
scp -r .next/ user@vps:/path/to/app/
scp package.json user@vps:/path/to/app/
scp next.config.ts user@vps:/path/to/app/

# Na VPS, instalar apenas produção
npm install --only=production
npm start
```

## 📊 Verificação da Instalação

```bash
# Verificar dependências instaladas
npm list --depth=0

# Verificar apenas produção
npm list --only=production --depth=0

# Verificar apenas desenvolvimento
npm list --only=development --depth=0

# Testar build
npm run build

# Testar start
npm start
```

## 🔧 Configurações de Sistema

### Requisitos Mínimos
- **RAM:** 2GB (recomendado 4GB)
- **Espaço:** 2GB livres
- **Node.js:** v18+ (recomendado v20+)
- **npm:** v9+

### Otimizações de Sistema
```bash
# Aumentar limite de arquivos abertos
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Configurar swap se necessário
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📞 Suporte

Se os problemas persistirem:

1. Execute o script de diagnóstico:
   ```bash
   node -v && npm -v && npm config list
   ```

2. Verifique logs detalhados:
   ```bash
   npm install --verbose --loglevel silly
   ```

3. Teste conectividade:
   ```bash
   curl -I https://registry.npmjs.org/
   ```

## 🎯 Resumo dos Comandos

```bash
# Solução completa em uma linha
cp .npmrc-vps .npmrc && npm cache clean --force && rm -rf node_modules package-lock.json && npm install --only=production --no-audit --no-fund && npm install --only=development --no-audit --no-fund
```