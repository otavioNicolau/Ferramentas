'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Lang } from './config';

interface I18nContextType {
  lang: Lang;
  dict: Record<string, string>;
  t: (key: string, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  lang: Lang;
  dict: Record<string, string>;
  children: ReactNode;
}

export function I18nProvider({ lang, dict, children }: I18nProviderProps) {
  const t = (key: string, vars?: Record<string, string>): string => {
    let translation = dict[key] || key;
    
    // Implementar interpolação simples: Hello {name}
    if (vars) {
      Object.entries(vars).forEach(([varKey, varValue]) => {
        const placeholder = `{${varKey}}`;
        translation = translation.replace(new RegExp(placeholder, 'g'), varValue);
      });
    }
    
    return translation;
  };

  const value: I18nContextType = {
    lang,
    dict,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}

// Hook para obter apenas a função de tradução (mais conveniente)
export function useTranslation() {
  const { t } = useI18n();
  return { t };
}

// Hook para obter o idioma atual
export function useCurrentLang(): Lang {
  const { lang } = useI18n();
  return lang;
}