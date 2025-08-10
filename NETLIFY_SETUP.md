# 🚀 Configuração Netlify - Passo a Passo

## 1. Preparação dos Arquivos

✅ **Arquivos já configurados:**
- `netlify.toml` - Configurações principais
- `.nvmrc` - Versão do Node.js (20)
- `public/_redirects` - Redirecionamentos SPA
- `next.config.ts` - Configurações Next.js para Netlify
- `package.json` - Scripts e dependências atualizados

## 2. Deploy no Netlify

### Passo 1: Conectar Repositório
1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Conecte seu GitHub/GitLab/Bitbucket
4. Selecione este repositório

### Passo 2: Configurações de Build
```
Build command: npm run build:netlify
Publish directory: .next
Node version: 20
```

**Nota:** O comando `build:netlify` foi configurado para ignorar warnings do ESLint que não impedem o funcionamento da aplicação.

### Passo 3: Variáveis de Ambiente (Opcional)
Se necessário, adicione em Site Settings > Environment variables:
```
NODE_VERSION=20
NPM_FLAGS=--legacy-peer-deps
```

### Passo 4: Instalar Plugin
O plugin `@netlify/plugin-nextjs` será instalado automaticamente via `netlify.toml`

## 3. Verificação Pós-Deploy

### ✅ Testes Obrigatórios:
1. **Página inicial:** `https://seu-site.netlify.app/`
2. **Navegação interna:** Clique nos links do menu
3. **Acesso direto:** Digite uma URL de subpágina diretamente
4. **Recarga de página:** Pressione F5 em qualquer subpágina
5. **API routes:** Teste endpoints `/api/*`

### 🔧 Se houver erro 404:
1. Verifique se o plugin Next.js está ativo
2. Confirme que o `netlify.toml` está na raiz
3. Verifique os logs de deploy no Netlify

## 4. Configurações Avançadas

### Domínio Personalizado
1. Site Settings > Domain management
2. Add custom domain
3. Configure DNS conforme instruções

### Deploy Previews
1. Site Settings > Build & deploy
2. Deploy contexts
3. Enable deploy previews

### Monitoramento
- **Logs de deploy:** Netlify Dashboard
- **Function logs:** Site Settings > Functions
- **Performance:** Lighthouse CI (opcional)

---

## 🎯 Resultado Esperado

Com essas configurações, seu site terá:
- ✅ Zero erros 404 em subpáginas
- ✅ Recarga de página funcionando
- ✅ API routes operacionais
- ✅ Deploy automático no Git push
- ✅ Performance otimizada

**🚀 Pronto para produção!**