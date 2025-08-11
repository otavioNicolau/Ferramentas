import type { Metadata } from 'next';
import { getTranslations } from '@/config/language';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/data/tools';

const t = getTranslations();
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

export const metadata: Metadata = {
  title: t.toolsPageTitle,
  description: t.toolsPageDescription,
  keywords: t.toolsPageKeywords,
  alternates: { canonical: `${baseUrl}/tools` },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">{t.toolsPageTitle}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              title={tool.title}
              description={tool.description}
              href={tool.href}
              icon={tool.icon}
              category={tool.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
