# Sistema de Tradução por Subdomínio - MUILTOOLS

Este projeto implementa um sistema de tradução baseado em subdomínios da URL, permitindo que diferentes idiomas sejam acessados através de subdomínios específicos.

## Como Funciona o Sistema de Idiomas

O idioma é automaticamente detectado baseado no subdomínio da URL:

- **muiltools.com** → Português (pt-BR) - idioma padrão
- **ko.muiltools.com** → Coreano (ko)
- **en.muiltools.com** → Inglês (en)
- **es.muiltools.com** → Espanhol (es)
- **zh.muiltools.com** → Chinês (zh)
- E assim por diante para todos os 20 idiomas suportados

**Não é mais necessário configurar variáveis de ambiente** - o sistema detecta automaticamente o idioma pela URL.

## Idiomas Disponíveis

- **Português (pt-BR)**
- **Inglês (en)**
- **Espanhol (es)**
- **Chinês (zh)**
- **Hindi (hi)**
- **Árabe (ar)**
- **Bengali (bn)**
- **Russo (ru)**
- **Japonês (ja)**
- **Alemão (de)**
- **Francês (fr)**
- **Italiano (it)**
- **Coreano (ko)**
- **Turco (tr)**
- **Polonês (pl)**
- **Holandês (nl)**
- **Sueco (sv)**
- **Ucraniano (uk)**
- **Vietnamita (vi)**
- **Tailandês (th)**

## Estrutura do Sistema

### Arquivo de Configuração
- `src/config/language.ts`: Contém as traduções e configuração do idioma atual

### Componentes Traduzidos
- **Header**: Nome do site, navegação
- **Footer**: Texto de rodapé e privacidade
- **Página Principal**: Título, subtítulo, descrição, placeholder de busca
- **Ferramentas**: Títulos, descrições e categorias

### Como Funciona

1. O middleware intercepta todas as requisições e detecta o subdomínio
2. O subdomínio é mapeado para o código de idioma correspondente
3. A função `detectLanguageFromURL()` identifica o idioma baseado na URL
4. A função `getTranslations()` retorna as traduções do idioma detectado
5. A função `getCurrentLanguage()` retorna o idioma atual da URL
6. Os componentes usam essas funções para exibir o conteúdo traduzido automaticamente

## Adicionando Novos Idiomas

Para adicionar um novo idioma:

1. Adicione o código do idioma ao tipo `Language` em `src/config/language.ts`
2. Adicione o código à lista `LANGUAGE_LIST`
3. Adicione o mapeamento no objeto `subdomainToLanguage` (tanto no arquivo de configuração quanto no middleware)
4. Adicione as traduções no objeto `TRANSLATIONS`
5. Adicione as informações do idioma em `availableLanguages`
6. Configure o subdomínio correspondente no DNS (ex: `novo.muiltools.com`)

## Vantagens deste Sistema

- ✅ **Automático**: Detecção automática de idioma baseada na URL
- ✅ **SEO Friendly**: Cada idioma tem sua própria URL (subdomínio)
- ✅ **Rápido**: Sem dependências externas pesadas
- ✅ **Flexível**: Fácil de adicionar novos idiomas
- ✅ **Centralizado**: Todas as traduções em um local
- ✅ **Escalável**: Suporte a 20 idiomas diferentes
- ✅ **Compatível**: Funciona com Next.js 15 e Turbopack
- ✅ **Sem Configuração**: Não requer variáveis de ambiente

## Exemplo de Uso

```typescript
import { getTranslations } from '@/config/language';

export default function MeuComponente() {
  const t = getTranslations();
  
  return (
    <div>
      <h1>{t.heroTitle}</h1>
      <p>{t.heroDescription}</p>
    </div>
  );
}
```