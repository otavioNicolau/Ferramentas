import { getTranslations } from '@/config/language';

export default function AboutPage() {
  const t = getTranslations();
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t.about}</h1>
      <p>Este site oferece diversas ferramentas online gratuitas para facilitar o seu dia a dia.</p>
    </div>
  );
}
