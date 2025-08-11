import { getTranslations } from '@/config/language';

export default function ContactPage() {
  const t = getTranslations();
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t.contact}</h1>
      <p>Entre em contato pelo e-mail <a href="mailto:contato@example.com" className="text-blue-600">contato@example.com</a>.</p>
    </div>
  );
}
