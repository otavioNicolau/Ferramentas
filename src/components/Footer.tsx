'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/client';
import { useRouter } from 'next/navigation';

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49 0-.24-.01-.86-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.13-1.52-1.13-1.52-.92-.64.07-.63.07-.63 1.02.07 1.55 1.07 1.55 1.07.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .85-.28 2.78 1.05a9.28 9.28 0 0 1 5.06 0c1.92-1.33 2.77-1.05 2.77-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.06 10.06 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M20.98 3.5h-3.16l-4.36 6.2L8.24 3.5H3.02l7 9.86-6.62 7.14h3.16l4.83-6.07 5.04 6.07h5.03l-7.46-9.08L20.98 3.5Z"
      />
    </svg>
  );
}
function YouTubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M23.5 7.09a4.54 4.54 0 0 0-3.2-3.22C18.6 3.33 12 3.33 12 3.33s-6.6 0-8.3.54A4.54 4.54 0 0 0 .5 7.09C0 8.82 0 12 0 12s0 3.18.5 4.91a4.54 4.54 0 0 0 3.2 3.22c1.7.54 8.3.54 8.3.54s6.6 0 8.3-.54a4.54 4.54 0 0 0 3.2-3.22C24 15.18 24 12 24 12s0-3.18-.5-4.91ZM9.6 15.45V8.55L15.82 12 9.6 15.45Z"
      />
    </svg>
  );
}

export default function Footer() {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();
  const router = useRouter();

  const primaryLinks = [
    { href: 'https://muiltools.com/', label: t('nav.home'), external: true },
    { href: '/about', label: t('nav.about', { fallback: 'Sobre' }) },
    { href: '/contact', label: t('nav.contact', { fallback: 'Contato' }) },
    { href: '/languages', label: t('footer.languages', { fallback: 'Idiomas' }) },
  ];

  const legalLinks = [
    { href: '/legal', label: t('footer.legal', { fallback: 'Legal' }) },
    { href: '/privacy-policy', label: t('footer.privacy') },
    { href: '/terms-of-use', label: t('footer.terms') },
    { href: '/sitemap.xml', label: t('footer.sitemap', { fallback: 'Sitemap' }) },
  ];

  return (
    <footer className="relative bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-zinc-200/70">
      {/* linha decorativa */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200/80 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Top: brand + nav */}
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3 text-center md:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label={t('app.title')}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105">
                {/* logomarca simples */}
                <span className="text-sm font-bold">M</span>
              </span>
              <span className="text-lg font-semibold tracking-tight text-zinc-900">
                {t('app.title')}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-600">
              {t('footer.description', { fallback: 'Ferramentas úteis para o dia a dia — simples, rápidas e seguras.' })}
            </p>
          </div>

          {/* Navegação principal */}
          <nav
            aria-label="Footer primary"
            className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6"
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t('footer.navigation', { fallback: 'Navegação' })}
              </h3>
              <ul className="mt-3 space-y-2">
                {primaryLinks.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t('footer.legal', { fallback: 'Legal' })}
              </h3>
              <ul className="mt-3 space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-700 hover:text-zinc-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t('footer.followUs', { fallback: 'Siga-nos' })}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="https://github.com/otavioNicolau"
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label="GitHub"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-zinc-200 bg-white hover:ring-zinc-300 transition"
                >
                  <GitHubIcon className="h-5 w-5 text-zinc-600 group-hover:text-zinc-900" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter / X"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-zinc-200 bg-white hover:ring-zinc-300 transition"
                >
                  <TwitterIcon className="h-5 w-5 text-zinc-600 group-hover:text-zinc-900" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-zinc-200 bg-white hover:ring-zinc-300 transition"
                >
                  <YouTubeIcon className="h-5 w-5 text-zinc-600 group-hover:text-zinc-900" />
                </a>
              </div>

              <div className="mt-4">
                <div className="space-y-2">
                  <label htmlFor="language-select" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    🌐 {t('nav.selectLanguage', { fallback: 'Selecionar Idioma' })}
                  </label>
                  <select
                     id="language-select"
                     value={lang}
                     onChange={(e) => {
                       const newLang = e.target.value;
                       const currentPath = window.location.pathname;
                       
                       // Mapeamento de códigos de idioma para subdomínios
                       const langToSubdomain: Record<string, string> = {
                         'pt-BR': 'br',
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
                       
                       const subdomain = langToSubdomain[newLang] || 'en';
                       const newUrl = `https://${subdomain}.muiltools.com${currentPath}`;
                       window.location.href = newUrl;
                     }}
                    className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-300 transition-colors"
                  >
                    <option value="pt-BR">🇧🇷 Português</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="hi">🇮🇳 हिन्दी</option>
                    <option value="ar">🇸🇦 العربية</option>
                    <option value="bn">🇧🇩 বাংলা</option>
                    <option value="ru">🇷🇺 Русский</option>
                    <option value="ja">🇯🇵 日本語</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="it">🇮🇹 Italiano</option>
                    <option value="ko">🇰🇷 한국어</option>
                    <option value="tr">🇹🇷 Türkçe</option>
                    <option value="pl">🇵🇱 Polski</option>
                    <option value="nl">🇳🇱 Nederlands</option>
                    <option value="sv">🇸🇪 Svenska</option>
                    <option value="uk">🇺🇦 Українська</option>
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="th">🇹🇭 ไทย</option>
                  </select>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-zinc-100" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-zinc-500">
            © {year} {t('app.title')}. {t('footer.privacyText', { fallback: 'Respeitamos sua privacidade.' })}
          </p>

          <p className="text-xs text-zinc-500">
            {t('footer.madeWith', { fallback: 'Feito com' })} <span aria-hidden>❤️</span>{' '}
            {t('footer.by', { fallback: 'por' })} {t('app.title')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
