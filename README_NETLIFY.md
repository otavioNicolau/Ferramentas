# Deploy no Netlify - Guia Completo

## 📋 Pré-requisitos

- Conta no [Netlify](https://netlify.com)
- Repositório Git (GitHub, GitLab, ou Bitbucket)
- Node.js versão 20 ou superior

## 🚀 Configuração do Deploy

### 1. Configurações no Netlify Dashboard

1. **Conecte seu repositório:**
   - Acesse o Netlify Dashboard
   - Clique em "New site from Git"
   - Conecte seu provedor Git e selecione o repositório

2. **Configurações de Build:**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Variáveis de Ambiente:**
   - Vá em Site settings > Environment variables
   - Adicione as seguintes variáveis:
   ```
   NODE_VERSION=20
   NPM_FLAGS=--legacy-peer-deps
   ```

### 2. Arquivos de Configuração Incluídos

#### `netlify.toml`
- Configurações de build e deploy
- Plugin @netlify/plugin-nextjs
- Redirecionamentos para SPA
- Configurações de funções serverless

#### `.nvmrc`
- Especifica a versão do Node.js (20)

#### `public/_redirects`
- Redirecionamentos adicionais
- Fallback para SPA

#### `next.config.ts`
- Configurado para output standalone
- Imagens não otimizadas (compatível com Netlify)
- Trailing slash habilitado

### 3. Scripts Adicionados no package.json

```json
{
  "scripts": {
    "export": "next export",
    "netlify-build": "npm run build"
  }
}
```

## 🔧 Resolução de Problemas Comuns

### Erro 404 em Subpáginas

✅ **Solucionado com:**
- Redirecionamentos configurados no `netlify.toml`
- Arquivo `_redirects` na pasta public
- Configuração `trailingSlash: true` no Next.js

### Problemas com API Routes

✅ **Solucionado com:**
- Plugin @netlify/plugin-nextjs
- Redirecionamento `/api/*` para funções Netlify
- Configuração de funções no `netlify.toml`

### Problemas de Build

✅ **Solucionado com:**
- Node.js versão 20 especificada
- Flag `--legacy-peer-deps` para dependências
- Configuração `esmExternals: 'loose'`

## 📝 Checklist de Deploy

- [ ] Repositório conectado ao Netlify
- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`
- [ ] Variáveis de ambiente configuradas
- [ ] Plugin @netlify/plugin-nextjs instalado
- [ ] Teste de navegação direta em subpáginas
- [ ] Teste de recarga de página
- [ ] Teste de API routes

## 🌐 Domínio Personalizado

1. Vá em Site settings > Domain management
2. Clique em "Add custom domain"
3. Configure os DNS records conforme instruções
4. Aguarde a propagação (pode levar até 24h)

## 📊 Monitoramento

- **Deploy logs:** Disponíveis no dashboard do Netlify
- **Function logs:** Site settings > Functions
- **Analytics:** Disponível no plano Pro

## 🔄 Deploy Automático

O deploy será automático a cada push para a branch principal (main/master).

### Configurar Deploy Preview

1. Site settings > Build & deploy
2. Deploy contexts
3. Habilite "Deploy previews" para pull requests

---

**✅ Com essas configurações, seu site Next.js funcionará perfeitamente no Netlify, incluindo:**
- Navegação por links internos
- Acesso direto a subpáginas
- Recarga de página sem erro 404
- API routes funcionais
- Deploy automático