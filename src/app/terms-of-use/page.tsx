import { getTranslations } from '@/config/language';

export default function TermsOfUsePage() {
  const t = getTranslations();
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t.termsOfUse}</h1>
      <p>Ao utilizar este site, você concorda com os termos e condições estabelecidos nesta página.</p>
    </div>
  );
}
