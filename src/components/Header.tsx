'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useI18n } from '@/i18n/client';

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isActive
          ? 'text-blue-600 shadow-sm'
          : 'text-zinc-700 hover:text-blue-600',
      ].join(' ')}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { t, lang } = useI18n();

  const handleLanguageChange = (newLang: string) => {
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
  };

  // Atalhos de teclado e controle do menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC para fechar menu
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        return;
      }
      
      // Ctrl+M para alternar menu mobile (apenas em telas pequenas)
      if (e.ctrlKey && e.key === 'm' && window.innerWidth < 768) {
        e.preventDefault();
        setIsMenuOpen(!isMenuOpen);
        return;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Controle do scroll do body quando menu está aberto
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // sombra/borda ao rolar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all duration-300 ease-in-out',
        'bg-white/70',
        'border-b border-zinc-200/70',
        scrolled ? 'shadow-sm ring-1 ring-black/5' : '',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Skip to content */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
          >
            {t('nav.skipToContent', { fallback: 'Pular para o conteúdo' })}
          </a>

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-zinc-900">
                {t('app.title')}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            <NavLink href="/">{t('nav.home')}</NavLink>
            <NavLink href="/tools">{t('nav.tools', { fallback: 'Ferramentas' })}</NavLink>
            <NavLink href="/about">{t('nav.about', { fallback: 'Sobre' })}</NavLink>
            <NavLink href="/contact">{t('nav.contact', { fallback: 'Contato' })}</NavLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Selector - Desktop */}
            <div className="hidden sm:block relative">
              <select
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="h-9 pl-8 pr-3 text-sm bg-white border border-zinc-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-300 transition-colors appearance-none cursor-pointer"
                aria-label={t('nav.selectLanguage', { fallback: 'Selecionar Idioma' })}
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
              <Globe size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? t('nav.closeMenu', { fallback: 'Fechar menu' }) : t('nav.openMenu', { fallback: 'Abrir menu' })}
              type="button"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav + Overlay */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
        isMenuOpen 
          ? 'max-h-96 opacity-100 visible' 
          : 'max-h-0 opacity-0 invisible'
      }`}>
        {/* overlay para fechar ao clicar fora */}
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-16 z-50 mx-4 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl transform transition-transform duration-300 ease-in-out"
          role="navigation"
          aria-label="Menu de navegação mobile"
        >
          <nav aria-label="Mobile" className="space-y-1">
            <NavLink href="/" onClick={() => setIsMenuOpen(false)}>
              {t('nav.home')}
            </NavLink>
            <NavLink href="/tools" onClick={() => setIsMenuOpen(false)}>
              {t('nav.tools', { fallback: 'Ferramentas' })}
            </NavLink>
            <NavLink href="/about" onClick={() => setIsMenuOpen(false)}>
              {t('nav.about', { fallback: 'Sobre' })}
            </NavLink>
            <NavLink href="/contact" onClick={() => setIsMenuOpen(false)}>
              {t('nav.contact', { fallback: 'Contato' })}
            </NavLink>
            <div className="mt-2">
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => {
                    handleLanguageChange(e.target.value);
                    setIsMenuOpen(false);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-300 transition-colors appearance-none cursor-pointer"
                  aria-label={t('nav.selectLanguage', { fallback: 'Selecionar Idioma' })}
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
                <Globe size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
