'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/client';
import { Mail, Copy, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  // Texto via i18n (fallbacks seguros)
  const title = t.contact || 'Contato';
  const intro =
    t.contactIntro ||
    'Entre em contato por e-mail.';
  const emailLabel = t.emailLabel || 'E-mail';
  const emailUs = t.emailUs || 'Enviar e-mail';
  const copyEmail = t.copyEmail || 'Copiar e-mail';
  const copiedLabel = t.copied || 'Copiado!';
  const responseTime = t.responseTime || 'Tempo médio de resposta: 24–48h';
  const siteName = t.siteName || 'Muiltools';

  const email = 'otavio.nicollau+tools@gmail.com';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Se o navegador não permitir, não quebra a UI
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900">
        {title}
      </h1>

      <p className="mb-6 text-zinc-700">
        {intro}{' '}
        <a
          href={`mailto:${email}`}
          className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          {email}
        </a>.
      </p>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="block text-sm text-zinc-500">
              {emailLabel}
            </span>
            <code className="select-all text-base font-semibold text-zinc-900">
              {email}
            </code>
            <p className="mt-1 text-xs text-zinc-500">
              {responseTime}
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {emailUs}
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              aria-live="polite"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                  {copiedLabel}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden />
                  {copyEmail}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* JSON-LD de contato para SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteName,
            contactPoint: [
              {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email,
                availableLanguage: ['pt-BR', 'en', 'es'],
              },
            ],
          }),
        }}
      />
    </div>
  );
}
