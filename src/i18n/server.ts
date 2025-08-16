import { headers, cookies } from 'next/headers';
import { Lang, DEFAULT_LANG, isValidLang } from './config';

// Cache simples para evitar re-imports no mesmo request
const dictionaryCache = new Map<Lang, Record<string, string>>();

export async function getDictionary(lang: Lang): Promise<Record<string, string>> {
  // Verificar cache primeiro
  if (dictionaryCache.has(lang)) {
    return dictionaryCache.get(lang)!;
  }
  
  try {
    // Import dinâmico do arquivo JSON
    const dict = await import(`@/locales/${lang}.json`);
    const dictionary = dict.default as Record<string, string>;
    
    // Armazenar no cache
    dictionaryCache.set(lang, dictionary);
    
    return dictionary;
  } catch (error) {
    console.warn(`Failed to load dictionary for language: ${lang}. Falling back to ${DEFAULT_LANG}`);
    
    // Fallback para idioma padrão
    if (lang !== DEFAULT_LANG) {
      return getDictionary(DEFAULT_LANG);
    }
    
    // Se até o idioma padrão falhar, retornar objeto vazio
    return {};
  }
}

export async function getRequestLang(): Promise<Lang> {
  // Durante o build (static generation), não temos acesso a headers/cookies
  // Verificar se estamos em contexto de build
  if (typeof window === 'undefined' && !process.env.NEXT_RUNTIME) {
    // Durante build time, retornar idioma padrão
    return DEFAULT_LANG;
  }
  
  try {
    // Tentar ler do header x-lang primeiro (setado pelo middleware)
    const headersList = await headers();
    const langFromHeader = headersList.get('x-lang');
    
    if (langFromHeader && isValidLang(langFromHeader)) {
      return langFromHeader;
    }
    
    // Fallback para cookie lang
    const cookieStore = await cookies();
    const langFromCookie = cookieStore.get('lang')?.value;
    
    if (langFromCookie && isValidLang(langFromCookie)) {
      return langFromCookie;
    }
    
    // Fallback final para idioma padrão
    return DEFAULT_LANG;
  } catch (error) {
    // Em caso de erro (ex: fora do contexto de request), usar idioma padrão
    console.warn('Failed to get request language, using default:', error);
    return DEFAULT_LANG;
  }
}

// Função utilitária para obter dicionário baseado no request atual
export async function getRequestDictionary(): Promise<Record<string, string>> {
  const lang = await getRequestLang();
  return getDictionary(lang);
}

// Limpar cache (útil para desenvolvimento)
export function clearDictionaryCache(): void {
  dictionaryCache.clear();
}