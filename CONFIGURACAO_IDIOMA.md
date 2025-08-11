# Sistema de Tradução Configurável

Este projeto implementa um sistema de tradução simples baseado em configuração, permitindo alterar facilmente o idioma da aplicação.

## Como Configurar o Idioma

Defina o idioma padrão criando um arquivo `.env` na raiz do projeto (ou utilizando `.env.example` como base) e configurando a variável:

```
NEXT_PUBLIC_DEFAULT_LANGUAGE=pt-BR
```

Altere o valor para `en` para utilizar inglês.

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

## Estrutura do Sistema

### Arquivo de Configuração
- `src/config/language.ts`: Contém as traduções e configuração do idioma atual

### Componentes Traduzidos
- **Header**: Nome do site, navegação
- **Footer**: Texto de rodapé e privacidade
- **Página Principal**: Título, subtítulo, descrição, placeholder de busca
- **Ferramentas**: Títulos, descrições e categorias

### Como Funciona

1. O idioma é definido pela variável de ambiente `NEXT_PUBLIC_DEFAULT_LANGUAGE`
2. A função `getTranslations()` retorna as traduções do idioma atual
3. A função `getCurrentLanguage()` retorna o idioma configurado
4. Os componentes usam essas funções para exibir o conteúdo traduzido

## Adicionando Novos Idiomas

Para adicionar um novo idioma:

1. Adicione o código do idioma ao tipo `Language`
2. Adicione as traduções no objeto `translations`
3. Adicione as ferramentas traduzidas no objeto `toolsData`
4. Configure `NEXT_PUBLIC_DEFAULT_LANGUAGE` para o novo idioma

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