import { getTranslations } from '@/config/language';

export default function PrivacyPolicyPage() {
  const t = getTranslations();
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t.privacyPolicy}</h1>
      <p>Esta política de privacidade descreve como suas informações são utilizadas e protegidas ao utilizar este site.</p>
    </div>
  );
}
