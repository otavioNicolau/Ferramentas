import { getDictionary, getRequestLang } from '@/i18n/server';

export default async function PrivacyPolicyPage() {
  const lang = await getRequestLang();
  const t = await getDictionary(lang);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t.privacy.title}</h1>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacy.introduction}</h2>
          <p className="mb-4">
            {t.privacy.introText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacy.dataCollection}</h2>
          <p className="mb-4">
            {t.privacy.dataCollectionText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacy.cookies}</h2>
          <p className="mb-4">
            {t.privacy.cookiesText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacy.dataUse}</h2>
          <p className="mb-4">
            {t.privacy.dataUseText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacy.dataSharing}</h2>
          <p className="mb-4">
            {t.privacy.dataSharingText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacy.rights}</h2>
          <p className="mb-4">
            {t.privacy.rightsText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.privacy.contact}</h2>
          <p className="mb-4">
            {t.privacy.contactText}
          </p>
        </section>
      </div>
    </div>
  );
}
