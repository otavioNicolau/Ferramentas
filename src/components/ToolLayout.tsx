'use client';

import { useI18n } from '@/i18n/client';
import { ShieldCheck } from 'lucide-react';
import React from 'react';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
  const { t } = useI18n();

  // Chaves de tradução
  const privacyTitle = t('privacy.title', { fallback: '🔒 Privacidade Garantida' });
  const privacyBody = t('privacy.description', { fallback: 'Todos os arquivos são processados localmente no seu navegador. Suas informações não são enviadas para nossos servidores.' });

  return (
    <section className="min-h-screen pt-20 bg-gradient-to-b from-white to-gray-50">
      {/* Glow/hero sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40rem_20rem_at_50%_-2rem,rgba(59,130,246,0.08),transparent)]"
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da ferramenta */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            {title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto">
            {description}
          </p>
        </header>

        {/* Conteúdo da ferramenta */}
        <main
          id="tool-content"
          role="region"
          aria-label={title}
          className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 md:p-8"
        >
          {children}
        </main>

        {/* Aviso de privacidade (traduzível) */}
        <aside className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              aria-hidden
              className="mt-0.5 h-5 w-5 text-blue-600"
            />
            <p className="text-sm text-blue-800">
              <strong className="font-semibold">{privacyTitle}:</strong>{' '}
              {privacyBody}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
