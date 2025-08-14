# 🚀 Guia Completo para VPS - Nicollau Tools

## 📋 Problema Resolvido

Este guia resolve o problema de **dependências de desenvolvimento não instalarem na VPS**.

## 🛠️ Arquivos Criados

### Scripts de Instalação
- **`install-vps.sh`** - Script automatizado para Linux/Ubuntu VPS
- **`install-vps.ps1`** - Script automatizado para Windows VPS
- **`diagnose-vps.js`** - Script de diagnóstico para identificar problemas

### Configurações
- **`.npmrc-vps`** - Configuração npm otimizada para VPS
- **`VPS_INSTALL_GUIDE.md`** - Guia detalhado de troubleshooting

### Scripts npm Adicionados
```json
{
  "vps:diagnose": "Diagnosticar problemas de instalação",
  "vps:install": "Instalação completa otimizada",
  "vps:install-prod": "Instalar apenas dependências de produção",
  "vps:install-dev": "Instalar apenas dependências de desenvolvimento",
  "vps:setup": "Configurar e instalar tudo automaticamente",
  "vps:build": "Build otimizado para produção"
}
```

## 🚀 Soluções Rápidas

### Opção 1: Script Automatizado (Recomendado)

**Linux/Ubuntu VPS:**
```bash
chmod +x install-vps.sh
./install-vps.sh
```

**Windows VPS:**
```powershell
PowerShell -ExecutionPolicy Bypass -File install-vps.ps1
```

### Opção 2: Scripts npm

```bash
# Diagnóstico completo
npm run vps:diagnose

# Setup completo (configuração + instalação)
npm run vps:setup

# Apenas instalação
npm run vps:install

# Build para produção
npm run vps:build
```

### Opção 3: Instalação Manual

```bash
# 1. Configurar npm
cp .npmrc-vps .npmrc

# 2. Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json

# 3. Instalar produção
npm run vps:install-prod

# 4. Instalar desenvolvimento
npm run vps:install-dev
```

## 🔍 Diagnóstico de Problemas

### Executar Diagnóstico
```bash
npm run vps:diagnose
```

O script verifica:
- ✅ Informações do sistema (RAM, CPU, espaço)
- ✅ Versões do Node.js e npm
- ✅ Conectividade com registry.npmjs.org
- ✅ Configurações do npm
- ✅ Arquivos do projeto
- ✅ Dependências problemáticas
- ✅ Permissões de arquivo
- ✅ Teste de instalação

### Problemas Comuns

| Problema | Solução |
|----------|----------|
| `ENOTFOUND registry.npmjs.org` | Verificar DNS/conectividade |
| `EACCES: permission denied` | Configurar permissões npm |
| `gyp ERR! stack Error` | Instalar build tools |
| `Maximum call stack` | Aumentar memória Node.js |
| Timeout durante instalação | Aumentar timeouts npm |

## 📦 Estratégias de Instalação

### 1. Instalação Separada (Recomendado)
```bash
# Primeiro produção
npm run vps:install-prod

# Depois desenvolvimento
npm run vps:install-dev
```

### 2. Instalação Seletiva
```bash
# Apenas dependências críticas
npm install --save-dev typescript @types/node @types/react @types/react-dom
npm install --save-dev tailwindcss eslint eslint-config-next
```

### 3. Build sem Dev Dependencies
```bash
# Se dev dependencies falharem
npm run vps:install-prod
npm run build
```

## 🎯 Comandos de Emergência

### Reset Completo
```bash
npm cache clean --force
rm -rf node_modules package-lock.json .npmrc
cp .npmrc-vps .npmrc
npm install --legacy-peer-deps
```

### Instalação Forçada
```bash
npm install --force --legacy-peer-deps --no-audit --no-fund
```

### Build de Emergência
```bash
# Instalar mínimo necessário
npm install next react react-dom --save
npm install typescript @types/node --save-dev
npm run build
```

## 🔧 Configurações Otimizadas

### .npmrc para VPS
```ini
registry=https://registry.npmjs.org/
timeout=300000
fetch-timeout=300000
legacy-peer-deps=true
fund=false
audit=false
progress=false
loglevel=error
```

### Variáveis de Ambiente
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
export NPM_CONFIG_PROGRESS=false
export NPM_CONFIG_LOGLEVEL=error
```

## 📊 Monitoramento

### Verificar Status
```bash
# Listar dependências instaladas
npm list --depth=0

# Verificar apenas produção
npm list --only=production --depth=0

# Verificar apenas desenvolvimento
npm list --only=development --depth=0

# Testar build
npm run build
```

### Logs Detalhados
```bash
# Instalação com logs verbosos
npm install --verbose --loglevel silly

# Build com logs
npm run build --verbose
```

## 🚀 Deploy em Produção

### Opção 1: Build na VPS
```bash
npm run vps:setup
npm run build
npm start
```

### Opção 2: Build Local + Deploy
```bash
# Local
npm run build

# Copiar para VPS
scp -r .next/ package.json next.config.ts user@vps:/app/

# Na VPS
npm run vps:install-prod
npm start
```

## 📞 Suporte

Se os problemas persistirem:

1. **Execute diagnóstico:** `npm run vps:diagnose`
2. **Consulte guia detalhado:** `VPS_INSTALL_GUIDE.md`
3. **Verifique logs:** `npm install --verbose`
4. **Teste conectividade:** `ping registry.npmjs.org`

## ✅ Checklist de Sucesso

- [ ] Node.js v18+ instalado
- [ ] npm v9+ instalado
- [ ] Conectividade com registry.npmjs.org
- [ ] Configuração .npmrc aplicada
- [ ] Dependências de produção instaladas
- [ ] Dependências de desenvolvimento instaladas
- [ ] Build executado com sucesso
- [ ] Aplicação iniciando corretamente

---

**🎯 Resultado Esperado:** Todas as dependências instaladas e aplicação funcionando perfeitamente na VPS!