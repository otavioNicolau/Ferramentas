import type { Metadata } from 'next';
import { getTranslations } from '@/config/language';

export function generateMetadata(): Metadata {
  const t = getTranslations();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return {
    title: t.aboutPageTitle ?? t.about ?? 'Sobre',
    description:
      t.aboutPageDescription ??
      'Este site oferece diversas ferramentas online gratuitas para facilitar o seu dia a dia.',
    keywords: t.aboutPageKeywords,
    alternates: { canonical: `${baseUrl}/about` },
  };
}

export default function AboutPage() {
  const t = getTranslations();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{t.aboutPageTitle ?? t.about}</h1>
      <p className="text-lg text-gray-700">
        {t.aboutPageDescription ??
          'Este site oferece diversas ferramentas online gratuitas para facilitar o seu dia a dia.'}
      </p>

      {/* Mantido do seu branch para preservar conteúdo */}
      <p className="mt-4 text-gray-700">
        Este site oferece diversas ferramentas online gratuitas para facilitar o seu dia a dia.
      </p>
    </div>
  );
}
