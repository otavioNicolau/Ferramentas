'use client';

import { useState, useMemo } from 'react';
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Domínio base (pode vir de env)
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'muiltools.com';

  // Mapear código -> subdomínio (fallback: o próprio código simplificado)
  const getSubdomainForLanguage = (langCode: string) => {
    const map: Record<string, string> = {
      en: 'en', es: 'es', zh: 'zh', hi: 'hi', ar: 'ar', bn: 'bn', ru: 'ru',
      ja: 'ja', de: 'de', fr: 'fr', it: 'it', ko: 'ko', tr: 'tr', pl: 'pl',
      nl: 'nl', sv: 'sv', uk: 'uk', vi: 'vi', th: 'th',
    };
    // se não estiver no mapa, usa a parte antes do hífen (ex.: 'pt-BR' -> 'pt')
    return map[langCode] || langCode.split('-')[0] || 'en';
  };

  // URL por idioma
  const getLanguageUrl = (langCode: string) => {
    if (langCode === 'pt-BR') return `https://${baseDomain}`;
    const sub = getSubdomainForLanguage(langCode);
    return `https://${sub}.${baseDomain}`;
  };

  // Lista de idiomas (ordenada por nome exibido)
  const languages: LanguageInfo[] = useMemo(() => {
    const list = Object.entries(LANGUAGE_CONFIG.availableLanguages).map(([code, info]) => ({
      ...info,
      code,
      url: getLanguageUrl(code),
      isActive: code === currentLanguage,
    }));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [currentLanguage]);

  const handleCopyUrl = async (url: string, code: string) => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    }
  };

  // Textos traduzidos (com fallbacks)
  const pageTitle = t.languagesPageTitle || t.languages || 'Idiomas';
  const pageDesc =
    t.languagesPageDescription ||
    'Acesse o site no seu idioma preferido. Todas as ferramentas estão disponíveis em múltiplos idiomas.';
  const totalLanguagesLabel = t.totalLanguages || 'Idiomas Disponíveis';
  const translationCoverageLabel = t.translationCoverage || 'Cobertura de Tradução';
  const globalAccessLabel = t.globalAccess || 'Acesso Global';
  const currentLanguageLabel = t.currentLanguage || 'Idioma Atual';
  const visitSiteLabel = t.visitSite || 'Visitar Site';
  const copiedLabel = t.copied || 'Copiado!';
  const copyUrlLabel = t.copyUrl || 'Copiar URL';
  const howItWorks = t.howItWorks || 'Como Funciona';
  const automaticDetection = t.automaticDetection || 'Detecção Automática';
  const automaticDetectionDesc =
    t.automaticDetectionDesc ||
    'O idioma é detectado automaticamente pelo subdomínio. Cada idioma tem sua própria URL única.';
  const seoFriendly = t.seoFriendly || 'SEO Otimizado';
  const seoFriendlyDesc =
    t.seoFriendlyDesc ||
    'Cada versão traduzida possui URL própria (hreflang), favorecendo indexação e compartilhamento.';
  const languagesFooter =
    t.languagesFooter ||
    'Todas as ferramentas estão disponíveis em todos os idiomas listados acima.';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Globe className="mr-3 h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
          </div>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">{pageDesc}</p>
        </div>

        {/* Estatísticas */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-3xl font-bold text-blue-600">{languages.length}</div>
            <div className="text-gray-600 dark:text-gray-300">{totalLanguagesLabel}</div>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-3xl font-bold text-green-600">100%</div>
            <div className="text-gray-600 dark:text-gray-300">{translationCoverageLabel}</div>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <div className="mb-2 text-3xl font-bold text-purple-600">🌍</div>
            <div className="text-gray-600 dark:text-gray-300">{globalAccessLabel}</div>
          </div>
        </div>

        {/* Lista */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className={`rounded-xl border-2 bg-white p-6 shadow-lg transition-all duration-300 dark:bg-gray-800 ${
                lang.isActive
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-transparent hover:border-blue-200 dark:hover:border-blue-700'
              }`}
            >
              <div className="mb-4 text-center">
                <div className="mb-2 text-4xl">{lang.flag}</div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {lang.name}
                </h3>
                <div className="font-mono text-sm text-gray-500 dark:text-gray-400">{lang.code}</div>
                {lang.isActive && (
                  <div className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {currentLanguageLabel}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <a
                  href={lang.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {visitSiteLabel}
                </a>

                <button
                  onClick={() => handleCopyUrl(lang.url, lang.code)}
                  className="flex w-full items-center justify-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  aria-live="polite"
                  aria-label={`${copyUrlLabel}: ${lang.code}`}
                >
                  {copiedCode === lang.code ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      {copiedLabel}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {copyUrlLabel}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 break-all rounded bg-gray-50 p-2 font-mono text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {lang.url}
              </div>
            </div>
          ))}
        </div>

        {/* Info extra */}
        <div className="mt-12 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{howItWorks}</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {automaticDetection}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{automaticDetectionDesc}</p>
            </div>
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {seoFriendly}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{seoFriendlyDesc}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">{languagesFooter}</p>
        </div>

        {/* JSON-LD simples para idiomas/URLs alternadas */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: t.siteName || 'Muiltools',
              url: `https://${baseDomain}`,
              inLanguage: languages.map((l) => l.code),
              potentialAction: {
                '@type': 'SearchAction',
                target: `https://${baseDomain}/search?q={query}`,
                'query-input': 'required name=query',
              },
            }),
          }}
        />
      </div>
    </div>
  );
}
