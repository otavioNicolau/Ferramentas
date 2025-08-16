export const SUBDOMAIN_TO_LANG = {
  br: 'pt-BR',
  pt: 'pt-BR', // aceitar 'pt' também
  en: 'en',
  es: 'es',
  ko: 'ko',
  zh: 'zh',
  hi: 'hi',
  ar: 'ar',
  bn: 'bn',
  ru: 'ru',
  ja: 'ja',
  de: 'de',
  fr: 'fr',
  it: 'it',
  tr: 'tr',
  pl: 'pl',
  nl: 'nl',
  sv: 'sv',
  uk: 'uk',
  vi: 'vi',
  th: 'th'
} as const;

export const DEFAULT_LANG = 'pt-BR';

export const SUPPORTED_LANGS = Object.values(SUBDOMAIN_TO_LANG);

export type Lang = typeof SUBDOMAIN_TO_LANG[keyof typeof SUBDOMAIN_TO_LANG];

export function resolveLangFromHost(host: string): Lang {
  // Extrair subdomínio do host
  const parts = host.split('.');
  
  // Se não há subdomínio (ex: muiltools.com), usar DEFAULT_LANG
  if (parts.length <= 2) {
    return DEFAULT_LANG;
  }
  
  const subdomain = parts[0];
  
  // Mapear subdomínio para idioma
  const lang = SUBDOMAIN_TO_LANG[subdomain as keyof typeof SUBDOMAIN_TO_LANG];
  
  return lang || DEFAULT_LANG;
}

export function isValidLang(lang: string): lang is Lang {
  return SUPPORTED_LANGS.includes(lang as Lang);
}