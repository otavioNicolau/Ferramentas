'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '@/i18n/client';

type Consent = 'accepted' | 'declined' | null;

export default function CookieBanner() {
  const { t } = useI18n();

  // null = ainda não verificou; 'accepted' | 'declined' = já decidiu
  const [consent, setConsent] = useState<Consent>(null);
  const [open, setOpen] = useState(false);

  // Lê localStorage no cliente e abre o banner se ainda não aceitou
  useEffect(() => {
    const saved = (localStorage.getItem('cookie-consent') as Consent) ?? null;
    setConsent(saved);
    setOpen(saved !== 'accepted');

    // Sincroniza entre abas
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cookie-consent') {
        const val = (e.newValue as Consent) ?? null;
        setConsent(val);
        setOpen(val !== 'accepted');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setConsent('accepted');
    setOpen(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setConsent('declined');
    setOpen(false);
  };

  if (!open) return null;

  // Traduções
  const cookieTitle = t('cookies.title', { fallback: 'Cookies' });
  const cookieMessage = t('cookies.message', { fallback: 'Usamos cookies para melhorar sua experiência.' });
  const acceptLabel = t('cookies.accept', { fallback: 'Aceitar' });
  const declineLabel = t('cookies.decline', { fallback: 'Recusar' });
  const learnMoreLabel = t('cta.learnMore', { fallback: 'Saiba mais' });

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6">
      <div
        role="dialog"
        aria-live="polite"
        aria-label={cookieTitle}
        className={[
          'mx-auto max-w-4xl rounded-2xl border bg-zinc-900/90 text-white backdrop-blur',
          'border-zinc-800 shadow-lg ring-1 ring-black/10',
          // animação suave (respeita prefers-reduced-motion)
          'transition-all duration-300 motion-safe:translate-y-0 motion-safe:opacity-100',
        ].join(' ')}
      >
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-semibold">{cookieTitle}</p>
              <p className="mt-1 text-sm text-zinc-200">{cookieMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/privacy-policy"
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-zinc-200 underline-offset-4 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {learnMoreLabel}
            </Link>
            <button
              type="button"
              onClick={declineCookies}
              className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {declineLabel}
            </button>
            <button
              type="button"
              onClick={acceptCookies}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {acceptLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
