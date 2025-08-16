'use client';

import { useI18n } from '@/i18n/client';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10rem,rgba(255,255,255,0.18),transparent)]"
      />
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            {t('hero.badge')}
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
          {t('hero.title')}
        </h1>
        
        <p className="mt-4 text-xl md:text-2xl opacity-90">
          {t('hero.subtitle')}
        </p>
        
        <p className="mx-auto mt-3 max-w-2xl text-lg opacity-90">
          {t('hero.description')}
        </p>
        
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl">
            {t('cta.tryNow')}
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10">
            {t('cta.learnMore')}
          </button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold">{t('stats.tools')}</div>
            <div className="text-sm opacity-80">{t('stats.toolsLabel')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{t('stats.users')}</div>
            <div className="text-sm opacity-80">{t('stats.usersLabel')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{t('stats.countries')}</div>
            <div className="text-sm opacity-80">{t('stats.countriesLabel')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}