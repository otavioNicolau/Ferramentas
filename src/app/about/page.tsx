import type { Metadata } from 'next';
import { getTranslations } from '@/config/language';

const t = getTranslations();
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

export const metadata: Metadata = {
  title: t.aboutPageTitle,
  description: t.aboutPageDescription,
  keywords: t.aboutPageKeywords,
  alternates: { canonical: `${baseUrl}/about` },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{t.aboutPageTitle}</h1>
      <p className="text-lg text-gray-700">{t.aboutPageDescription}</p>
    </div>
  );
}
