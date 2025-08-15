'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { getTranslations, LANGUAGE_CONFIG, getCurrentLanguage } from '@/config/language';

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

  const t = getTranslations();
  const currentLanguage = getCurrentLanguage();

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
            {t.skipToContent}
          </a>

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-zinc-900">
                {t.siteName}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
            <NavLink href="/">{t.home}</NavLink>
            <NavLink href="/tools">{t.tools}</NavLink>
            <NavLink href="/about">{t.about}</NavLink>
            <NavLink href="/contact">{t.contact}</NavLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Selector - Desktop */}
            <div className="hidden sm:block relative">
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="h-9 pl-8 pr-3 text-sm bg-white border border-zinc-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-300 transition-colors appearance-none cursor-pointer"
                aria-label={t.selectLanguage || 'Selecionar Idioma'}
              >
                {Object.entries(LANGUAGE_CONFIG.availableLanguages).map(([code, config]) => (
                  <option key={code} value={code}>
                    {config.flag} {config.name}
                  </option>
                ))}
              </select>
              <Globe size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? (t.closeMenu || 'Fechar menu') : (t.openMenu || 'Abrir menu')}
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
              {t.home}
            </NavLink>
            <NavLink href="/tools" onClick={() => setIsMenuOpen(false)}>
              {t.tools}
            </NavLink>
            <NavLink href="/about" onClick={() => setIsMenuOpen(false)}>
              {t.about}
            </NavLink>
            <NavLink href="/contact" onClick={() => setIsMenuOpen(false)}>
              {t.contact}
            </NavLink>
            <div className="mt-2">
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => {
                    handleLanguageChange(e.target.value);
                    setIsMenuOpen(false);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-zinc-300 transition-colors appearance-none cursor-pointer"
                  aria-label={t.selectLanguage || 'Selecionar Idioma'}
                >
                  {Object.entries(LANGUAGE_CONFIG.availableLanguages).map(([code, config]) => (
                    <option key={code} value={code}>
                      {config.flag} {config.name}
                    </option>
                  ))}
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
