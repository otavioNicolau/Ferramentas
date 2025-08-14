'use client';

import { useState } from 'react';
import { getTranslations, LANGUAGE_CONFIG, getCurrentLanguage } from '@/config/language';
import { Globe, ExternalLink, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface LanguageInfo {
  name: string;
  flag: string;
  code: string;
  url: string;
  isActive: boolean;
}

export default function LanguagesPage() {
  const t = getTranslations();
  const currentLanguage = getCurrentLanguage();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Função para gerar URL do idioma
  const getLanguageUrl = (langCode: string) => {
    const baseUrl = 'https://muiltools.com';
    
    // Se for português (padrão), usar domínio principal
    if (langCode === 'pt-BR') {
      return baseUrl;
    }
    
    // Para outros idiomas, usar subdomínio
    const subdomain = getSubdomainForLanguage(langCode);
    return `https://${subdomain}.muiltools.com`;
  };

  // Mapear código de idioma para subdomínio
  const getSubdomainForLanguage = (langCode: string) => {
    const subdomainMap: Record<string, string> = {
      'en': 'en',
      'es': 'es',
      'zh': 'zh',
      'hi': 'hi',
      'ar': 'ar',
      'bn': 'bn',
      'ru': 'ru',
      'ja': 'ja',
      'de': 'de',
      'fr': 'fr',
      'it': 'it',
      'ko': 'ko',
      'tr': 'tr',
      'pl': 'pl',
      'nl': 'nl',
      'sv': 'sv',
      'uk': 'uk',
      'vi': 'vi',
      'th': 'th'
    };
    return subdomainMap[langCode] || 'en';
  };

  // Preparar lista de idiomas
  const languages: LanguageInfo[] = Object.entries(LANGUAGE_CONFIG.availableLanguages).map(([code, info]) => ({
    ...info,
    url: getLanguageUrl(code),
    isActive: code === currentLanguage
  }));

  // Copiar URL para clipboard
  const handleCopyUrl = async (url: string, langCode: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedUrl(langCode);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" style={{ background: '#ffffff !important' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {t.languagesPageTitle || 'Idiomas Disponíveis'}
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t.languagesPageDescription || 'Acesse o MUILTOOLS em seu idioma preferido. Todas as ferramentas estão disponíveis em 20 idiomas diferentes.'}
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{languages.length}</div>
            <div className="text-gray-600 dark:text-gray-300">{t.totalLanguages || 'Idiomas Disponíveis'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div className="text-gray-600 dark:text-gray-300">{t.translationCoverage || 'Cobertura de Tradução'}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">🌍</div>
            <div className="text-gray-600 dark:text-gray-300">{t.globalAccess || 'Acesso Global'}</div>
          </div>
        </div>

        {/* Lista de Idiomas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {languages.map((language) => (
            <div
              key={language.code}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                language.isActive
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-transparent hover:border-blue-200 dark:hover:border-blue-700'
              }`}
            >
              {/* Flag e Nome */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{language.flag}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {language.name}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {language.code}
                </div>
                {language.isActive && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-2">
                    {t.currentLanguage || 'Idioma Atual'}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="space-y-2">
                {/* Botão Visitar */}
                <a
                  href={language.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t.visitSite || 'Visitar Site'}
                </a>

                {/* Botão Copiar URL */}
                <button
                  onClick={() => handleCopyUrl(language.url, language.code)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                >
                  {copiedUrl === language.code ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      {t.copied || 'Copiado!'}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      {t.copyUrl || 'Copiar URL'}
                    </>
                  )}
                </button>
              </div>

              {/* URL Preview */}
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                {language.url}
              </div>
            </div>
          ))}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t.howItWorks || 'Como Funciona'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t.automaticDetection || 'Detecção Automática'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.automaticDetectionDesc || 'O idioma é detectado automaticamente baseado no subdomínio da URL. Cada idioma tem sua própria URL única.'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t.seoFriendly || 'SEO Otimizado'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.seoFriendlyDesc || 'Cada versão traduzida tem sua própria URL, otimizada para mecanismos de busca e fácil compartilhamento.'}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t.languagesFooter || 'Todas as ferramentas estão disponíveis em todos os idiomas listados acima.'}
          </p>
        </div>
      </div>
    </div>
  );
}