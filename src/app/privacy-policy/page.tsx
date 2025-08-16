import { getTranslations } from '@/config/language';

export default function PrivacyPolicyPage() {
  const t = getTranslations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t.privacyPolicy || 'Privacy Policy'}</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacyIntro || 'Introduction'}</h2>
          <p className="mb-4">
            {t.privacyIntroText || 'This Privacy Policy describes how Muiltools collects, uses, and protects your information when you use our website and services.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacyDataCollection || 'Data Collection'}</h2>
          <p className="mb-4">
            {t.privacyDataCollectionText || 'We collect information you provide directly to us, such as when you use our tools, contact us, or interact with our website.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacyCookies || 'Cookies and Tracking'}</h2>
          <p className="mb-4">
            {t.privacyCookiesText || 'We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacyDataUse || 'How We Use Your Data'}</h2>
          <p className="mb-4">
            {t.privacyDataUseText || 'We use collected information to provide, maintain, and improve our services, communicate with you, and ensure security.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacyDataSharing || 'Data Sharing'}</h2>
          <p className="mb-4">
            {t.privacyDataSharingText || 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacyRights || 'Your Rights'}</h2>
          <p className="mb-4">
            {t.privacyRightsText || 'You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.'}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacyContact || 'Contact Us'}</h2>
          <p className="mb-4">
            {t.privacyContactText || 'If you have any questions about this Privacy Policy, please contact us through our contact page.'}
          </p>
        </section>
      </div>
    </div>
  );
}
