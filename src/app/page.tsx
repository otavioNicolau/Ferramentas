import { tools, categories } from '@/data/tools';
import { getRequestLang, getDictionary } from '@/i18n/server';
import ToolsPageClient from '@/components/ToolsPageClient';

export default async function HomePage() {
  const lang = await getRequestLang();
  const dict = await getDictionary(lang);

  // Serializar tools para remover funções dos ícones
  const serializedTools = tools.map(tool => ({
    id: tool.id,
    title: tool.title,
    description: tool.description,
    href: tool.href,
    icon: tool.icon.name || 'DollarSign', // Usar apenas o nome do ícone
    category: tool.category
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10rem,rgba(255,255,255,0.18),transparent)]"
        />
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            {dict['hero.title']}
          </h1>
          <p className="mt-4 text-xl md:text-2xl opacity-90">{dict['hero.subtitle']}</p>
          <p className="mx-auto mt-3 max-w-2xl text-lg opacity-90">{dict['hero.description']}</p>
        </div>
      </section>

      {/* Tools Section */}
      <ToolsPageClient tools={serializedTools} categories={categories} />
    </div>
  );
}
