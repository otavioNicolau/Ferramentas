# Sistema de Tradução Configurável

Este projeto implementa um sistema de tradução simples baseado em configuração, permitindo alterar facilmente o idioma da aplicação.

## Como Configurar o Idioma

Para alterar o idioma da aplicação, edite o arquivo `src/config/language.ts`:

```typescript
// Para usar português (padrão)
export const CURRENT_LANGUAGE: Language = 'pt-BR';

// Para usar inglês
export const CURRENT_LANGUAGE: Language = 'en';
```

## Idiomas Disponíveis

- **Português (pt-BR)**: Idioma padrão
- **Inglês (en)**: Idioma alternativo

## Estrutura do Sistema

### Arquivo de Configuração
- `src/config/language.ts`: Contém as traduções e configuração do idioma atual

### Componentes Traduzidos
- **Header**: Nome do site, navegação
- **Footer**: Texto de rodapé e privacidade
- **Página Principal**: Título, subtítulo, descrição, placeholder de busca
- **Ferramentas**: Títulos, descrições e categorias

### Como Funciona

1. O idioma é definido na constante `CURRENT_LANGUAGE`
2. A função `getTranslations()` retorna as traduções do idioma atual
3. A função `getCurrentLanguage()` retorna o idioma configurado
4. Os componentes usam essas funções para exibir o conteúdo traduzido

## Adicionando Novos Idiomas

Para adicionar um novo idioma:

1. Adicione o código do idioma ao tipo `Language`
2. Adicione as traduções no objeto `translations`
3. Adicione as ferramentas traduzidas no objeto `toolsData`
4. Configure `CURRENT_LANGUAGE` para o novo idioma

## Vantagens deste Sistema

- ✅ **Simples**: Apenas uma configuração para alterar todo o idioma
- ✅ **Rápido**: Sem dependências externas pesadas
- ✅ **Flexível**: Fácil de adicionar novos idiomas
- ✅ **Centralizado**: Todas as traduções em um local
- ✅ **Compatível**: Funciona com Next.js 15 e Turbopack

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