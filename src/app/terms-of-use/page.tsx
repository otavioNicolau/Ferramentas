'use client';

import { useI18n } from '@/i18n/client';

export default function TermsOfUsePage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t.termsOfUse || 'Terms of Use'}</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.termsAcceptance || 'Acceptance of Terms'}</h2>
          <p className="mb-4">
            {t.termsAcceptanceText || 'By accessing and using Muiltools, you accept and agree to be bound by the terms and provision of this agreement.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.termsUseOfService || 'Use of Service'}</h2>
          <p className="mb-4">
            {t.termsUseOfServiceText || 'You may use our service for lawful purposes only. You agree not to use the service in any way that violates any applicable laws or regulations.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.termsUserContent || 'User Content'}</h2>
          <p className="mb-4">
            {t.termsUserContentText || 'You retain ownership of any content you submit, post or display on or through the service. You are responsible for the content you provide.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.termsProhibitedUse || 'Prohibited Uses'}</h2>
          <p className="mb-4">
            {t.termsProhibitedUseText || 'You may not use our service for any illegal or unauthorized purpose, to violate any laws, or to harm or exploit others.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.termsDisclaimer || 'Disclaimer'}</h2>
          <p className="mb-4">
            {t.termsDisclaimerText || 'The information on this website is provided on an "as is" basis. We disclaim all warranties and make no representations regarding the accuracy or reliability of the content.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.termsModification || 'Modification of Terms'}</h2>
          <p className="mb-4">
            {t.termsModificationText || 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on the website.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.termsContact || 'Contact Information'}</h2>
          <p className="mb-4">
            {t.termsContactText || 'If you have any questions about these Terms of Use, please contact us through our contact page.'}
          </p>
        </section>
      </div>
    </div>
  );
}
