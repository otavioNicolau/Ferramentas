import { getTranslations } from '@/config/language';

export default function LegalPage() {
  const t = getTranslations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t.legal || 'Legal'}</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.legalCompanyInfo || 'Company Information'}</h2>
          <p className="mb-4">
            {t.legalCompanyInfoText || 'Muiltools is a web-based platform providing various online tools and utilities for productivity and convenience.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.legalIntellectualProperty || 'Intellectual Property'}</h2>
          <p className="mb-4">
            {t.legalIntellectualPropertyText || 'All content, features, and functionality on this website are owned by Muiltools and are protected by international copyright, trademark, and other intellectual property laws.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.legalLiability || 'Limitation of Liability'}</h2>
          <p className="mb-4">
            {t.legalLiabilityText || 'Muiltools provides tools and services "as is" without any warranties. We are not liable for any damages arising from the use of our services.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.legalGoverningLaw || 'Governing Law'}</h2>
          <p className="mb-4">
            {t.legalGoverningLawText || 'These legal terms are governed by and construed in accordance with applicable laws.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.legalContact || 'Contact Information'}</h2>
          <p className="mb-4">
            {t.legalContactText || 'If you have any questions about these legal terms, please contact us through our contact page.'}
          </p>
        </section>
      </div>
    </div>
  );
}